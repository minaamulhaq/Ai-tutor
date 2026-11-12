from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class CanvasElementSummary(BaseModel):
    id: str
    type: Literal["stroke", "rectangle", "circle", "arrow", "text"]
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    title: Optional[str] = None
    text: Optional[str] = None
    color: Optional[str] = None


class CanvasContextPayload(BaseModel):
    elements: List[CanvasElementSummary] = Field(default_factory=list)
    selected_element_id: Optional[str] = None
    timestamp: Optional[int] = None


class BoardActionPayload(BaseModel):
    action: Literal[
        "add_title",
        "add_definition",
        "add_segment",
        "add_code",
        "add_formula",
        "add_box",
        "add_circle",
        "add_text",
        "add_arrow",
        "add_diagram",
        "edit_element",
        "delete_element",
        "highlight_element",
        "clear_board",
    ]
    target: Optional[str] = None
    language: Optional[str] = None
    diagram_type: Optional[Literal["flowchart", "hierarchy", "cycle", "comparison"]] = None
    nodes: Optional[List[str]] = None
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    endX: Optional[float] = None
    endY: Optional[float] = None
    title: Optional[str] = None
    text: Optional[str] = None
    color: Optional[str] = "#f97316"


class WSIncomingMessage(BaseModel):
    type: Literal[
        "start_session",
        "canvas_context",
        "audio_speech_segment",
        "audio_stream_start",
        "audio_stream_chunk",
        "audio_stream_stop",
        "clause_ack",
        "text_query",
        "barge_in_interrupt",
    ]
    canvas_context: Optional[CanvasContextPayload] = None
    audio_base64: Optional[str] = None
    mime_type: Optional[str] = "audio/webm"
    text: Optional[str] = None
    chunk_index: Optional[int] = None


class WSOutgoingMessage(BaseModel):
    type: Literal[
        "transcript_delta",
        "interim_transcript",
        "clause_step",
        "audio_chunk",
        "board_action",
        "preempt_flush",
        "turn_complete",
        "error",
    ]
    role: Optional[Literal["user", "assistant"]] = None
    text: Optional[str] = None
    audio_base64: Optional[str] = None
    sample_rate: Optional[int] = 24000
    board_action: Optional[BoardActionPayload] = None
    board_actions: Optional[List[BoardActionPayload]] = None
    chunk_index: Optional[int] = None
    detail: Optional[str] = None
