import asyncio
from typing import Dict, List, Optional
from app.schemas.protocol import BoardActionPayload, CanvasContextPayload


class PreemptionStateMachine:
    """
    Asynchronous Barge-In, Preemption & Lecture Delivery State Controller:
      1. Halt Generation (cancel active LLM stream)
      2. Cancel Synthesis (cancel in-flight TTS chunk tasks)
      3. Flush Audio Buffer (emit immediate preempt_flush packet to client DAC queue)
      4. Track Client-Confirmed Spoken Clauses vs. Unspoken Interrupted Remainder
      5. Track Lecture Curriculum Progress & Rolling Session Summary
    """

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.active_turn_task: Optional[asyncio.Task] = None
        self.cancel_event = asyncio.Event()

        # Shifted Dialogue History & Rolling Session Summary
        self.dialogue_history: List[Dict[str, str]] = []
        self.session_summary: List[str] = []

        # Per-Turn Delivery Tracking (Dispatched vs. Client-Confirmed Played)
        self.current_user_query: str = ""
        self.dispatched_clauses: Dict[int, str] = {}
        self.dispatched_actions: Dict[int, List[BoardActionPayload]] = {}
        self.confirmed_played_indices: set[int] = set()
        self.current_spoken_clauses: List[str] = []

        # Interrupted Lecture Continuity State (so teacher resumes seamlessly after answering a question)
        self.interrupted_spoken_text: str = ""
        self.interrupted_unspoken_text: str = ""

        # Lecture Curriculum & Whiteboard Delivery Ledger
        self.active_topic: str = ""
        self.delivered_outline: List[str] = []

        # Live Canvas Context
        self.canvas_context: CanvasContextPayload = CanvasContextPayload()

        # Live Streaming STT Buffer & Interim State while user is speaking
        self.streaming_audio_buffer: bytearray = bytearray()
        self.streaming_mime_type: str = "audio/webm"
        self.latest_interim_transcript: str = ""
        self.interim_stt_task: Optional[asyncio.Task] = None

    def update_canvas_context(self, ctx: CanvasContextPayload) -> None:
        self.canvas_context = ctx

    def begin_user_turn(self, user_text: str) -> None:
        """
        Records the student's question/utterance immediately when the turn starts
        so even if the student interrupts the teacher mid-reply, the student's original prompt is preserved.
        """
        clean = user_text.strip()
        self.current_user_query = clean
        if clean:
            self.dialogue_history.append({"role": "user", "content": clean})
        self.dispatched_clauses.clear()
        self.dispatched_actions.clear()
        self.confirmed_played_indices.clear()
        self.current_spoken_clauses = []

    def register_turn_task(self, task: asyncio.Task) -> None:
        self.cancel_event.clear()
        self.active_turn_task = task

    def _record_board_actions_delivered(self, actions: List[BoardActionPayload]) -> None:
        for act in actions:
            if act.action == "clear_board":
                self.delivered_outline.append("[Board Cleared for New Topic]")
            elif act.action == "add_title" and act.title:
                self.active_topic = act.title
                entry = f"Topic Title: {act.title}" + (f" ({act.text})" if act.text else "")
                if entry not in self.delivered_outline:
                    self.delivered_outline.append(entry)
            elif act.action == "add_definition" and act.title:
                entry = f"Definition: {act.title} — {act.text or ''}"
                if entry not in self.delivered_outline:
                    self.delivered_outline.append(entry)
            elif act.action == "add_segment" and act.title:
                entry = f"Segment: {act.title} — {act.text or ''}"
                if entry not in self.delivered_outline:
                    self.delivered_outline.append(entry)
            elif act.action == "add_code" and act.title:
                entry = f"Code File ({act.title}): {(act.text or '').replace(chr(10), ' | ')[:90]}"
                if entry not in self.delivered_outline:
                    self.delivered_outline.append(entry)
            elif act.action == "add_formula" and act.title:
                entry = f"Formula ({act.title}): {act.text or ''}"
                if entry not in self.delivered_outline:
                    self.delivered_outline.append(entry)
            elif act.action == "add_diagram" and act.nodes:
                entry = f"Diagram ({act.diagram_type or 'flowchart'}): {' -> '.join(act.nodes[:6])}"
                if entry not in self.delivered_outline:
                    self.delivered_outline.append(entry)

    def record_dispatched_clause(
        self,
        chunk_index: int,
        clause_text: str,
        actions: Optional[List[BoardActionPayload]] = None,
    ) -> None:
        """Records a clause & board actions sent by the backend to the client queue."""
        if clause_text.strip():
            self.dispatched_clauses[chunk_index] = clause_text.strip()
        if actions:
            self.dispatched_actions[chunk_index] = list(actions)
        # Chunk 0 starts playing immediately upon arrival if nothing is ahead of it
        if chunk_index == 0 and clause_text.strip():
            self.confirm_clause_played(0)

    def confirm_clause_played(self, chunk_index: int) -> None:
        """
        Called when the client browser confirms `audio.play()` started for `chunk_index`.
        Ensures the AI teacher knows accurately what the student has actually heard & seen.
        """
        if chunk_index in self.confirmed_played_indices:
            return
        self.confirmed_played_indices.add(chunk_index)
        clause_text = self.dispatched_clauses.get(chunk_index, "")
        if clause_text and clause_text not in self.current_spoken_clauses:
            self.current_spoken_clauses.append(clause_text)
        actions = self.dispatched_actions.get(chunk_index, [])
        if actions:
            self._record_board_actions_delivered(actions)

    def record_spoken_clause(self, clause_text: str) -> None:
        """Fallback helper if chunk_index is not provided."""
        if clause_text.strip() and clause_text.strip() not in self.current_spoken_clauses:
            self.current_spoken_clauses.append(clause_text.strip())

    def _compact_history_if_needed(self) -> None:
        """
        Instead of dropping older conversation turns, compress the oldest turns into
        `session_summary` so the teacher remembers the entire class session.
        """
        while len(self.dialogue_history) > 20:
            oldest_pair = self.dialogue_history[:2]
            self.dialogue_history = self.dialogue_history[2:]
            summary_parts = []
            for msg in oldest_pair:
                role_label = "Student" if msg["role"] == "user" else "Teacher"
                snippet = msg["content"][:160].replace("\n", " ")
                summary_parts.append(f"{role_label}: {snippet}")
            if summary_parts:
                self.session_summary.append(" | ".join(summary_parts))
            if len(self.session_summary) > 15:
                self.session_summary = self.session_summary[-15:]

    async def trigger_barge_in(self) -> Optional[str]:
        """
        Executes the Preemption State Machine when the student interrupts the teacher.
        Separates what the student actually heard from what was generated-but-unspoken
        so the teacher can answer the interruption and then seamlessly resume the lecture.
        """
        self.cancel_event.set()

        if self.active_turn_task and not self.active_turn_task.done():
            self.active_turn_task.cancel()
            try:
                await self.active_turn_task
            except asyncio.CancelledError:
                pass
            except Exception:
                pass

        self.active_turn_task = None

        # Compute confirmed spoken vs. unspoken remainder
        ordered_indices = sorted(self.dispatched_clauses.keys())
        spoken_parts: List[str] = []
        unspoken_parts: List[str] = []
        for idx in ordered_indices:
            txt = self.dispatched_clauses[idx]
            if idx in self.confirmed_played_indices:
                spoken_parts.append(txt)
            else:
                unspoken_parts.append(txt)

        if not spoken_parts and self.current_spoken_clauses:
            spoken_parts = list(self.current_spoken_clauses)

        spoken_so_far = " ".join(spoken_parts).strip()
        unspoken_remainder = " ".join(unspoken_parts).strip()

        if spoken_so_far or unspoken_remainder:
            self.interrupted_spoken_text = spoken_so_far
            self.interrupted_unspoken_text = unspoken_remainder

            history_note = spoken_so_far if spoken_so_far else "(Teacher was interrupted right as they began speaking)"
            if unspoken_remainder:
                history_note += f" [interrupted by student; teacher had not yet spoken: {unspoken_remainder}]"
            else:
                history_note += " [interrupted by student]"

            self.dialogue_history.append(
                {
                    "role": "assistant",
                    "content": history_note,
                }
            )
            self._compact_history_if_needed()

        self.dispatched_clauses.clear()
        self.dispatched_actions.clear()
        self.confirmed_played_indices.clear()
        self.current_spoken_clauses = []
        return spoken_so_far

    def commit_completed_turn(self, user_text: str, full_assistant_text: str) -> None:
        # Mark all dispatched clauses and board actions as delivered since the turn completed without interruption
        for idx in sorted(self.dispatched_clauses.keys()):
            self.confirm_clause_played(idx)

        # Ensure user message is present if begin_user_turn wasn't called
        if (
            user_text.strip()
            and (
                not self.dialogue_history
                or self.dialogue_history[-1].get("role") != "user"
            )
        ):
            self.dialogue_history.append({"role": "user", "content": user_text.strip()})

        if full_assistant_text.strip():
            self.dialogue_history.append(
                {"role": "assistant", "content": full_assistant_text.strip()}
            )

        # Clear any prior interrupted state once a full turn completes cleanly
        self.interrupted_spoken_text = ""
        self.interrupted_unspoken_text = ""

        self._compact_history_if_needed()
        self.dispatched_clauses.clear()
        self.dispatched_actions.clear()
        self.confirmed_played_indices.clear()
        self.current_spoken_clauses = []

