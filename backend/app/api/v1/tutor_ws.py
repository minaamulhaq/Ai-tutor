import asyncio
import base64
import json
import logging
import time
from typing import Dict, List, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.config import settings
from app.schemas.protocol import (
    BoardActionPayload,
    WSIncomingMessage,
    WSOutgoingMessage,
)
from app.services.barge_in_fsm import PreemptionStateMachine
from app.services.clause_chunker import ClauseBoundaryBuffer
from app.services.llm_service import llm_brain
from app.services.rag_service import rag_service
from app.services.stt_service import stt_service
from app.services.tts_service import tts_service

router = APIRouter()
perf_logger = logging.getLogger("uvicorn.error")


def perf(label: str, t0: float) -> None:
    """Logs milliseconds elapsed since t0 (shows up in the uvicorn console)."""
    perf_logger.info("[LATENCY] %-34s +%6.0f ms", label, (time.perf_counter() - t0) * 1000)

GREETING_TEXT = "Hi! How are you, and what would you like to study today?"
_cached_greeting_audio_b64: Optional[str] = None

# Active session state machines
sessions: Dict[str, PreemptionStateMachine] = {}


def get_or_create_fsm(session_id: str) -> PreemptionStateMachine:
    if session_id not in sessions:
        sessions[session_id] = PreemptionStateMachine(session_id=session_id)
    return sessions[session_id]


async def send_ws_message(ws: WebSocket, msg: WSOutgoingMessage) -> None:
    await ws.send_text(msg.model_dump_json(exclude_none=True))


async def send_initial_greeting(ws: WebSocket, fsm: PreemptionStateMachine) -> None:
    """
    Sends and synthesizes the opening AI Tutor greeting when the session begins:
    'Hi! How are you, and what would you like to study today?'
    Caches the synthesized audio after the first time for zero-latency session starts.
    """
    global _cached_greeting_audio_b64
    if not fsm.dialogue_history:
        fsm.dialogue_history.append({"role": "assistant", "content": GREETING_TEXT})

    try:
        t0 = time.perf_counter()
        if not _cached_greeting_audio_b64:
            _cached_greeting_audio_b64 = await tts_service.synthesize_clause_base64(GREETING_TEXT)
            perf("greeting: TTS synthesized", t0)
        else:
            perf("greeting: TTS cache hit (0ms)", t0)
        audio_b64 = _cached_greeting_audio_b64
        if audio_b64:
            await send_ws_message(
                ws,
                WSOutgoingMessage(
                    type="clause_step",
                    role="assistant",
                    text="",
                    audio_base64=audio_b64,
                    sample_rate=settings.TTS_SAMPLE_RATE,
                    chunk_index=0,
                ),
            )
    except Exception:
        pass


def _create_fallback_board_action(clause_text: str) -> BoardActionPayload:
    """
    Guarantees a visual canvas note is created if the LLM ever forgets to emit a [[DRAW:...]] tag.
    """
    words = clause_text.strip().split()
    summary = " ".join(words[:10])
    if len(words) > 10:
        summary += "..."
    return BoardActionPayload(
        action="add_segment",
        title="Key Takeaway",
        text=summary,
        color="#f97316",
    )


async def execute_overlapping_turn(
    ws: WebSocket,
    fsm: PreemptionStateMachine,
    user_text: str,
) -> None:
    """
    Executes the Overlapping Streaming Core Pipeline for a single student turn:
      1. RAG Retrieval + Canvas Context Conditioning
      2. Autoregressive Token Stream -> Clause & Punctuation Boundary Buffer
      3. Lockstep Clause Audio + Board Actions (sent together in `clause_step` so voice and drawing happen simultaneously)
    """
    chunker = ClauseBoundaryBuffer(min_words_per_chunk=5)
    chunk_index = 0
    total_actions_count = 0
    full_assistant_spoken: List[str] = []
    tts_tasks: List["asyncio.Task[str]"] = []
    send_queue: "asyncio.Queue" = asyncio.Queue()
    sender_task: "asyncio.Task | None" = None
    tts_semaphore = asyncio.Semaphore(1)
    t0 = time.perf_counter()
    first_token_seen = False
    first_clause_sent = False

    try:
        # Snapshot interrupted state from the prior turn BEFORE recording the new user turn
        prior_interrupted_spoken = fsm.interrupted_spoken_text
        prior_interrupted_unspoken = fsm.interrupted_unspoken_text
        fsm.begin_user_turn(user_text)

        rag_docs = await rag_service.retrieve_context(user_text, fsm.canvas_context)
        perf("turn: RAG done", t0)

        async def clause_sender() -> None:
            """Sends clause steps strictly in order while TTS for later clauses runs in parallel."""
            nonlocal chunk_index, first_clause_sent
            while True:
                item = await send_queue.get()
                if item is None:
                    return
                clause, actions, tts_task = item

                audio_b64 = ""
                if tts_task is not None:
                    try:
                        audio_b64 = await tts_task
                        perf(f"clause {chunk_index}: TTS ready", t0)
                    except asyncio.CancelledError:
                        raise
                    except Exception as tts_err:
                        await send_ws_message(
                            ws,
                            WSOutgoingMessage(
                                type="error",
                                detail=f"TTS warning: {str(tts_err)}",
                            ),
                        )

                if fsm.cancel_event.is_set():
                    return

                await send_ws_message(
                    ws,
                    WSOutgoingMessage(
                        type="clause_step",
                        role="assistant",
                        text=clause,
                        audio_base64=audio_b64 or None,
                        sample_rate=settings.TTS_SAMPLE_RATE,
                        board_actions=actions if actions else None,
                        chunk_index=chunk_index,
                    ),
                )

                if clause or actions:
                    fsm.record_dispatched_clause(chunk_index, clause, actions)
                if clause:
                    full_assistant_spoken.append(clause)
                if not first_clause_sent:
                    first_clause_sent = True
                    perf("FIRST clause_step sent to browser", t0)
                chunk_index += 1

        sender_task = asyncio.create_task(clause_sender())

        async def emit_clause_step(
            clause: str,
            actions: List[BoardActionPayload],
            is_final_flush: bool = False,
        ):
            nonlocal chunk_index, total_actions_count

            if fsm.cancel_event.is_set():
                return

            total_actions_count += len(actions)

            # Guarantee visual element generation if LLM finished without emitting a tag
            if is_final_flush and total_actions_count == 0 and clause and len(clause.split()) >= 4:
                actions = [_create_fallback_board_action(clause)]
                total_actions_count += 1

            # Synthesize clause 0 with exclusive priority so later clauses don't compete for TTS bandwidth
            async def _synth_prioritized(text_to_speak: str) -> str:
                async with tts_semaphore:
                    return await tts_service.synthesize_clause_base64(text_to_speak)

            tts_task = None
            if clause:
                tts_task = asyncio.create_task(_synth_prioritized(clause))
                tts_tasks.append(tts_task)
            send_queue.put_nowait((clause, actions, tts_task))

        # Stream tokens Δw from LLM Brain with full Lecture Continuity & Delivery Memory
        async for token in llm_brain.stream_response_tokens(
            user_query=user_text,
            canvas_context=fsm.canvas_context,
            dialogue_history=fsm.dialogue_history,
            rag_docs=rag_docs,
            active_topic=fsm.active_topic,
            delivered_outline=fsm.delivered_outline,
            session_summary=fsm.session_summary,
            interrupted_spoken=prior_interrupted_spoken,
            interrupted_unspoken=prior_interrupted_unspoken,
        ):
            if fsm.cancel_event.is_set():
                return

            if not first_token_seen:
                first_token_seen = True
                perf("LLM first token", t0)

            pairs = chunker.feed_token(token)
            for clause, actions in pairs:
                perf(f"clause ready (LLM->chunker): {clause[:24]!r}", t0)
                await emit_clause_step(clause, actions, is_final_flush=False)

        # Flush remaining buffer at end of stream
        if not fsm.cancel_event.is_set():
            rem_pairs = chunker.flush_remaining()
            for idx, (clause, actions) in enumerate(rem_pairs):
                await emit_clause_step(
                    clause,
                    actions,
                    is_final_flush=(idx == len(rem_pairs) - 1),
                )

            # Wait for all queued clauses to be synthesized and delivered in order
            send_queue.put_nowait(None)
            await sender_task
            perf("turn: all clauses delivered", t0)
            if fsm.cancel_event.is_set():
                return

            if not rem_pairs and total_actions_count == 0 and full_assistant_spoken:
                # If buffer was already empty but 0 actions were emitted during the turn, send a summary box
                fallback = _create_fallback_board_action(full_assistant_spoken[0])
                await send_ws_message(
                    ws,
                    WSOutgoingMessage(
                        type="clause_step",
                        role="assistant",
                        text="",
                        board_actions=[fallback],
                        chunk_index=chunk_index,
                    ),
                )

            fsm.commit_completed_turn(user_text, " ".join(full_assistant_spoken))
            await send_ws_message(ws, WSOutgoingMessage(type="turn_complete"))

    except asyncio.CancelledError:
        raise
    except Exception as e:
        perf_logger.error("[TURN ERROR] %s: %s", type(e).__name__, e)
        await send_ws_message(
            ws,
            WSOutgoingMessage(
                type="error",
                detail=str(e),
            ),
        )
    finally:
        for t in tts_tasks:
            if not t.done():
                t.cancel()
        if sender_task is not None and not sender_task.done():
            sender_task.cancel()


@router.websocket("/ws/tutor/{session_id}")
async def tutor_realtime_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    fsm = get_or_create_fsm(session_id)

    try:
        while True:
            raw_msg = await websocket.receive_text()
            data = json.loads(raw_msg)
            incoming = WSIncomingMessage(**data)

            # 0. Initial Session Greeting
            if incoming.type == "start_session":
                asyncio.create_task(send_initial_greeting(websocket, fsm))
                continue

            # 1. Update Live Canvas Context
            if incoming.type == "canvas_context" and incoming.canvas_context:
                fsm.update_canvas_context(incoming.canvas_context)
                continue

            # 1.5 Client Playback Confirmation Ack (tracks exact clause heard & board action drawn)
            if incoming.type == "clause_ack" and incoming.chunk_index is not None:
                fsm.confirm_clause_played(incoming.chunk_index)
                continue

            # 2. Asynchronous Barge-In & Preemption Trigger
            if incoming.type == "barge_in_interrupt":
                if settings.ENABLE_BARGE_IN:
                    await fsm.trigger_barge_in()
                    await send_ws_message(
                        websocket,
                        WSOutgoingMessage(type="preempt_flush"),
                    )
                continue

            # 2.5 Live Streaming STT (while user is speaking) -> Immediate LLM & TTS on stop
            if incoming.type == "audio_stream_start":
                # Only trigger barge-in if the student actually speaks long enough (checked on chunks/stop),
                # or if explicitly signaled by barge_in_interrupt.
                fsm.streaming_audio_buffer.clear()
                fsm.latest_interim_transcript = ""
                fsm.streaming_mime_type = incoming.mime_type or "audio/webm"
                if incoming.canvas_context:
                    fsm.update_canvas_context(incoming.canvas_context)
                continue

            if incoming.type == "audio_stream_chunk" and incoming.audio_base64:
                chunk_bytes = base64.b64decode(incoming.audio_base64)
                prev_len = len(fsm.streaming_audio_buffer)
                fsm.streaming_audio_buffer.extend(chunk_bytes)

                # Trigger background interim STT once every ~18KB of new audio so we don't spam the STT API
                if (
                    len(fsm.streaming_audio_buffer) >= 12000
                    and (len(fsm.streaming_audio_buffer) // 18000) > (prev_len // 18000)
                    and (fsm.interim_stt_task is None or fsm.interim_stt_task.done())
                ):
                    snapshot_bytes = bytes(fsm.streaming_audio_buffer)
                    mime = fsm.streaming_mime_type

                    async def _run_interim_stt(audio_data: bytes, m_type: str):
                        try:
                            t_int = time.perf_counter()
                            partial_text = await stt_service.transcribe_bytes(
                                audio_data, m_type
                            )
                            perf(f"interim STT while speaking ({len(audio_data) // 1024} KB)", t_int)
                            if partial_text:
                                fsm.latest_interim_transcript = partial_text
                                await send_ws_message(
                                    websocket,
                                    WSOutgoingMessage(
                                        type="interim_transcript",
                                        role="user",
                                        text=partial_text,
                                    ),
                                )
                        except Exception:
                            pass

                    fsm.interim_stt_task = asyncio.create_task(
                        _run_interim_stt(snapshot_bytes, mime)
                    )
                continue

            if incoming.type == "audio_stream_stop":
                if incoming.canvas_context:
                    fsm.update_canvas_context(incoming.canvas_context)
                if incoming.audio_base64:
                    fsm.streaming_audio_buffer.extend(
                        base64.b64decode(incoming.audio_base64)
                    )

                # Ignore tiny noise / echo blips (< 4 KB) so they never interrupt the AI teacher,
                # while still allowing short spoken answers like "Yes", "Okay", or "Why?"
                if len(fsm.streaming_audio_buffer) < 4000:
                    fsm.streaming_audio_buffer.clear()
                    fsm.latest_interim_transcript = ""
                    continue

                # Student spoke a real utterance: now preempt any active AI turn
                await fsm.trigger_barge_in()

                # If an interim STT was ALREADY computed right before stop and buffer hardly grew, reuse it!
                transcript = ""
                if (
                    fsm.latest_interim_transcript
                    and (fsm.interim_stt_task is None or fsm.interim_stt_task.done())
                    and (len(fsm.streaming_audio_buffer) % 18000) < 4000
                ):
                    transcript = fsm.latest_interim_transcript
                    perf("final STT reused from interim (0ms)", time.perf_counter())
                else:
                    try:
                        t_stt = time.perf_counter()
                        transcript = await stt_service.transcribe_bytes(
                            bytes(fsm.streaming_audio_buffer),
                            fsm.streaming_mime_type,
                        )
                        perf(
                            f"final STT on stop ({len(fsm.streaming_audio_buffer) // 1024} KB)",
                            t_stt,
                        )
                    except Exception:
                        transcript = fsm.latest_interim_transcript

                fsm.streaming_audio_buffer.clear()
                fsm.latest_interim_transcript = ""

                if not transcript:
                    continue

                await send_ws_message(
                    websocket,
                    WSOutgoingMessage(
                        type="transcript_delta",
                        role="user",
                        text=transcript,
                    ),
                )

                task = asyncio.create_task(
                    execute_overlapping_turn(websocket, fsm, transcript)
                )
                fsm.register_turn_task(task)
                continue

            # 3. Incoming Voice Speech Segment (Fallback single-shot)
            if incoming.type == "audio_speech_segment" and incoming.audio_base64:
                await fsm.trigger_barge_in()

                if incoming.canvas_context:
                    fsm.update_canvas_context(incoming.canvas_context)

                try:
                    t_stt = time.perf_counter()
                    transcript = await stt_service.transcribe_audio_base64(
                        incoming.audio_base64,
                        incoming.mime_type or "audio/webm",
                    )
                    perf(f"STT done ({len(incoming.audio_base64) // 1365} KB audio)", t_stt)
                except Exception as stt_err:
                    await send_ws_message(
                        websocket,
                        WSOutgoingMessage(
                            type="error",
                            detail=f"STT Error: {str(stt_err)}",
                        ),
                    )
                    continue

                if not transcript:
                    continue

                await send_ws_message(
                    websocket,
                    WSOutgoingMessage(
                        type="transcript_delta",
                        role="user",
                        text=transcript,
                    ),
                )

                task = asyncio.create_task(
                    execute_overlapping_turn(websocket, fsm, transcript)
                )
                fsm.register_turn_task(task)
                continue

            # 4. Direct Text Query
            if incoming.type == "text_query" and incoming.text:
                await fsm.trigger_barge_in()

                if incoming.canvas_context:
                    fsm.update_canvas_context(incoming.canvas_context)

                user_text = incoming.text.strip()
                await send_ws_message(
                    websocket,
                    WSOutgoingMessage(
                        type="transcript_delta",
                        role="user",
                        text=user_text,
                    ),
                )

                task = asyncio.create_task(
                    execute_overlapping_turn(websocket, fsm, user_text)
                )
                fsm.register_turn_task(task)

    except WebSocketDisconnect:
        if session_id in sessions:
            await sessions[session_id].trigger_barge_in()
            del sessions[session_id]
