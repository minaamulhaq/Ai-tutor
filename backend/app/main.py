import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.tutor_ws import router as tutor_ws_router
from app.core.config import settings

app = FastAPI(
    title="ZuhDemy Real-Time AI Tutor Backend",
    description=(
        "Low-Latency Voice & Canvas Agent using Overlapping Streaming Pipeline "
        "(ASR -> Autoregressive LLM -> Clause Boundary Buffer -> Incremental Neural TTS + Canvas Actions) "
        "and Asynchronous Barge-In Preemption Controller."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tutor_ws_router, prefix="/api/v1", tags=["Realtime AI Tutor"])


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "architecture": "Overlapping Streaming Core Pipeline + Barge-In Preemption FSM",
        "llm_provider": settings.LLM_PROVIDER,
        "llm_model": settings.LLM_MODEL_NAME,
        "stt_provider": settings.STT_PROVIDER,
        "stt_model": settings.STT_MODEL_NAME,
        "tts_provider": settings.TTS_PROVIDER,
        "tts_model": settings.TTS_MODEL_NAME,
    }


def start_server():
    """Entry point for `uv run dev` (avoids Windows multiprocessing reloader hang)."""
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
    )


if __name__ == "__main__":
    start_server()
