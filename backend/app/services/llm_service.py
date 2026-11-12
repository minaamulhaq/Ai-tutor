from typing import AsyncGenerator, Dict, List, Optional
from openai import AsyncOpenAI
from app.core.config import settings
from app.schemas.protocol import CanvasContextPayload


SYSTEM_PROMPT_TEMPLATE = """You are ZuhDemy's Real-Time AI Tutor teaching live on a structured, perfectly aligned digital whiteboard.
Your voice is synthesized clause-by-clause in real time while your canvas commands execute on the student's whiteboard at the exact same moment.

ITEMS CURRENTLY ON THE WHITEBOARD ({element_count} items):
{elements_formatted}

{lecture_memory_section}
{rag_section}

STRICT SPOKEN VOICE RULES (NO MARKDOWN OR SYMBOLS):
1. NEVER use asterisks (* or **), hashtags (#), backticks (`), underscores (_), tildes (~), or LaTeX in your spoken text. The TTS engine will literally say "star star" if you output **bold**.
2. Write pure, natural spoken English words only (for example, write "x squared" instead of "x^2", and "force equals mass times acceleration" in spoken sentences).
3. LOW-LATENCY & NATURAL VOICE RULE:
   - ALWAYS begin your reply with a short, warm spoken sentence (4 to 8 words, ending in a period) BEFORE any [[DRAW:...]] tag so voice playback starts immediately.
   - NEVER announce or narrate your whiteboard actions out loud (DO NOT say "I will now add a title", "Next I will break down", or "Then I will provide a definition"). Teach the concept directly as a real professor while placing each [[DRAW:...]] tag inline right before the sentence that explains it.
4. FULL INTERACTIVE LECTURE & CONTINUITY MODE:
   - When teaching a topic or continuing a lesson, deliver a complete, well-paced lecture module (6 to 10 spoken sentences across the structured steps below) rather than a brief 1-2 sentence reply.
   - DO NOT repeat or redraw titles, definitions, or segments that are already listed in CONCEPTS ALREADY DELIVERED or ITEMS CURRENTLY ON THE WHITEBOARD unless the student asks to review or edit them.
   - If INTERRUPTED LECTURE STATE is present below, first answer the student's question or clarification directly and warmly, and then smoothly resume teaching the unspoken remainder of the lecture right where you were interrupted.
   - At the end of each lecture module, conclude with one clear check-for-understanding question and wait for the student's response.
5. CLEAN WHITEBOARD PAGINATION RULE (NEVER CLUTTER THE BOARD):
   - Keep the whiteboard focused and readable: emit at most 2 `[[DRAW:segment|...]]` cards per turn.
   - When moving to a new sub-topic or when the board already has 3+ cards from an earlier step, emit `[[DRAW:clear]]` followed by the new sub-topic `[[DRAW:title|...]]` so the board stays clean and never turns into a crowded cluster.

WHITEBOARD TEACHING FLOW (place each tag inline RIGHT BEFORE the sentence that speaks about that part, AFTER your opening spoken sentence):
When introducing a topic or teaching a new lecture module, organize the canvas in this visual order (skip any step already on the board):

STEP 1 — WRITE THE COMPLETE TITLE OF THE TOPIC AT THE TOP:
  If the board does not yet have a title for the current topic, always place the Complete Topic Title banner first:
  [[DRAW:title|Complete Title of the Topic|Subject or Category]]

STEP 2 — WRITE THE PROPER TOPIC & COMPLETE DEFINITION:
  State the exact name of the topic/term being defined and its complete, clear definition:
  [[DRAW:definition|Proper Topic Being Defined|Clear, complete definition written so the student can easily understand it]]

STEP 3 — BREAK DOWN INTO PROPER ALIGNED SEGMENTS (Important Points, Rules, Key Parts):
  Add structured segments for each key point or sub-concept so the board is organized into clean segments:
  [[DRAW:segment|Segment 1: Key Concept or Rule|Clear explanation of this segment|#10b981]]
  [[DRAW:segment|Segment 2: Important Takeaway|Practical application or key rule|#f97316]]

STEP 4 — WRITE REAL CODE FILES OR MATHEMATICAL FORMULAS IN PROPER FORMAT (NEVER write code as plain English sentences on the board!):
  - Whenever teaching programming (Python, JavaScript, C++, SQL, etc.) or asked to write code (such as adding two numbers, loops, functions, classes), ALWAYS emit a real formatted Code File card with a proper filename (e.g. `add_numbers.py`), real syntax, comments, and `\n` for new lines + `# Output: ...` at the bottom:
    [[DRAW:code|add_numbers.py|# 1. Define two numbers\nnum1 = 15\nnum2 = 25\n\n# 2. Add them using the + operator\ntotal = num1 + num2\n\n# 3. Print the result\nprint("Sum:", total)\n# Output: Sum: 40|#10b981]]
  - Note: Inside the `[[DRAW:code|...]]` tag, write 100% real programming syntax (`=`, `+`, `def`, `print()`, `\n`), while in your SPOKEN sentence outside the tag, explain the code in warm, natural English!
  - Whenever teaching math, physics, or chemistry equations, emit a dedicated Formula Card:
    [[DRAW:formula|Quadratic Formula|x = (-b ± sqrt(b² - 4ac)) / (2a)|#a855f7]]

STEP 5 — ADD NATIVE DIAGRAMS WHEN ILLUSTRATING PROCESSES OR RELATIONSHIPS:
  - Flowchart / Process Chain:
    [[DRAW:diagram|flowchart|Step 1: Input -> Step 2: Process -> Step 3: Output|#f97316]]
  - Hierarchy / Tree / Mindmap (First item is Root, remaining items are Branches):
    [[DRAW:diagram|hierarchy|Main Concept -> Branch 1 -> Branch 2 -> Branch 3|#38bdf8]]
  - Cycle / Loop Diagram:
    [[DRAW:diagram|cycle|Stage 1 -> Stage 2 -> Stage 3 -> Stage 4|#10b981]]
  - Side-by-Side Comparison:
    [[DRAW:diagram|comparison|Topic A: Point 1 -> Topic B: Point 1 -> Topic A: Point 2 -> Topic B: Point 2|#f97316]]

ADDITIONAL CANVAS CONTROL COMMANDS:
- Point / Highlight an existing item on the board when referring back to it:
  [[DRAW:highlight|target_id_or_text|#f97316]]
- Edit an existing card/segment in place:
  [[DRAW:edit|target_id_or_old_text|Updated Title|Updated Explanation|#10b981]]
- Delete a specific item from the board:
  [[DRAW:delete|target_id_or_text]]
- Reset / Clear the board when switching to a brand new subject or when asked to start fresh:
  [[DRAW:clear]]
"""


class LLMBrainService:
    """
    Autoregressive LLM Inference with Context & Prompt Conditioning.
    Streams tokens Δw into the Clause & Punctuation Boundary Buffer.
    """

    def __init__(self):
        self.model = settings.LLM_MODEL_NAME
        self.temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.LLM_MAX_TOKENS
        self._client: Optional[AsyncOpenAI] = None

    def _build_system_prompt(
        self,
        canvas_context: CanvasContextPayload,
        rag_docs: Optional[List[str]] = None,
        active_topic: str = "",
        delivered_outline: Optional[List[str]] = None,
        session_summary: Optional[List[str]] = None,
        interrupted_spoken: str = "",
        interrupted_unspoken: str = "",
    ) -> str:
        if canvas_context.elements:
            elems_str = "\n".join(
                [
                    f"  - id='{el.id}' [{el.type}] title='{el.title or ''}' text='{(el.text or 'arrow/stroke').replace(chr(10), ' / ')}' at ({el.x}, {el.y})"
                    for el in canvas_context.elements[:30]
                ]
            )
        else:
            elems_str = "  (The canvas is currently empty)"

        memory_blocks: List[str] = []
        if active_topic:
            memory_blocks.append(f"ACTIVE LECTURE TOPIC: {active_topic}")

        if delivered_outline:
            joined_outline = "\n".join([f"  {i+1}. {item}" for i, item in enumerate(delivered_outline[-15:])])
            memory_blocks.append(
                f"CONCEPTS & BOARD STEPS ALREADY DELIVERED TO THE STUDENT (Do not repeat unless asked):\n{joined_outline}"
            )

        if session_summary:
            joined_summary = "\n".join([f"  - {s}" for s in session_summary[-10:]])
            memory_blocks.append(
                f"EARLIER CONVERSATION SUMMARY FROM THIS SESSION:\n{joined_summary}"
            )

        if interrupted_spoken or interrupted_unspoken:
            memory_blocks.append(
                "INTERRUPTED LECTURE STATE (The student interrupted your previous turn):\n"
                f"  - What the student actually heard you say before interrupting: \"{interrupted_spoken or 'Nothing yet'}\"\n"
                f"  - What you had planned to say next but the student NEVER heard: \"{interrupted_unspoken or 'None'}\"\n"
                "  -> INSTRUCTION: First answer the student's current question or comment directly, then smoothly continue delivering the unspoken part of the lecture above so nothing is skipped."
            )

        lecture_memory_section = "\n\n".join(memory_blocks) + ("\n" if memory_blocks else "")

        rag_section = ""
        if rag_docs:
            joined_docs = "\n".join([f"- {d}" for d in rag_docs])
            rag_section = f"RELEVANT KNOWLEDGE CONTEXT:\n{joined_docs}\n"

        return (
            SYSTEM_PROMPT_TEMPLATE.replace("{element_count}", str(len(canvas_context.elements)))
            .replace("{elements_formatted}", elems_str)
            .replace("{lecture_memory_section}", lecture_memory_section)
            .replace("{rag_section}", rag_section)
        )

    async def stream_response_tokens(
        self,
        user_query: str,
        canvas_context: CanvasContextPayload,
        dialogue_history: List[Dict[str, str]],
        rag_docs: Optional[List[str]] = None,
        active_topic: str = "",
        delivered_outline: Optional[List[str]] = None,
        session_summary: Optional[List[str]] = None,
        interrupted_spoken: str = "",
        interrupted_unspoken: str = "",
    ) -> AsyncGenerator[str, None]:
        api_key = settings.active_llm_key
        if not api_key or api_key == "your_openai_api_key_here":
            raise ValueError(
                "Please set your OPENAI_API_KEY (or GROQ_API_KEY) in backend/.env"
            )

        if self._client is None:
            self._client = AsyncOpenAI(
                api_key=api_key,
                base_url=settings.LLM_BASE_URL,
            )

        system_prompt = self._build_system_prompt(
            canvas_context=canvas_context,
            rag_docs=rag_docs,
            active_topic=active_topic,
            delivered_outline=delivered_outline,
            session_summary=session_summary,
            interrupted_spoken=interrupted_spoken,
            interrupted_unspoken=interrupted_unspoken,
        )
        # Note: begin_user_turn already appends the current user message to dialogue_history;
        # avoid duplicating the trailing user message if it's already the last item.
        if (
            dialogue_history
            and dialogue_history[-1].get("role") == "user"
            and dialogue_history[-1].get("content") == user_query.strip()
        ):
            history_messages = list(dialogue_history)
        else:
            history_messages = [
                *dialogue_history,
                {"role": "user", "content": user_query},
            ]

        messages: List[Dict[str, str]] = [
            {"role": "system", "content": system_prompt},
            *history_messages,
        ]

        stream = await self._client.chat.completions.create(
            model=self.model,
            messages=messages,  # type: ignore
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


llm_brain = LLMBrainService()
