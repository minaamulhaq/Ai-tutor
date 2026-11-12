import os
from typing import List
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    )

    # 1. LLM Brain Configuration
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
    LLM_MODEL_NAME: str = os.getenv("LLM_MODEL_NAME", "gpt-4o-mini")
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.4"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "1200"))

    # 2. Speech-to-Text (STT / ASR) Configuration
    STT_PROVIDER: str = os.getenv("STT_PROVIDER", "openai")
    STT_API_KEY: str = os.getenv("STT_API_KEY", "")
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")
    STT_MODEL_NAME: str = os.getenv("STT_MODEL_NAME", "whisper-1")
    STT_LANGUAGE: str = os.getenv("STT_LANGUAGE", "en")

    # 3. Text-to-Speech (TTS) Configuration
    TTS_PROVIDER: str = os.getenv("TTS_PROVIDER", "openai")
    TTS_API_KEY: str = os.getenv("TTS_API_KEY", "")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    TTS_MODEL_NAME: str = os.getenv("TTS_MODEL_NAME", "tts-1")
    TTS_VOICE_ID: str = os.getenv("TTS_VOICE_ID", "alloy")
    TTS_SAMPLE_RATE: int = int(os.getenv("TTS_SAMPLE_RATE", "24000"))

    # 4. Acoustic & VAD Preemption
    VAD_THRESHOLD: float = float(os.getenv("VAD_THRESHOLD", "0.5"))
    VAD_SILENCE_DURATION_MS: int = int(os.getenv("VAD_SILENCE_DURATION_MS", "450"))
    ENABLE_BARGE_IN: bool = os.getenv("ENABLE_BARGE_IN", "true").lower() == "true"

    # 5. RAG Configuration
    EMBEDDING_MODEL_NAME: str = os.getenv(
        "EMBEDDING_MODEL_NAME", "text-embedding-3-small"
    )
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def active_llm_key(self) -> str:
        if self.LLM_PROVIDER.lower() == "groq" and self.GROQ_API_KEY:
            return self.GROQ_API_KEY
        return self.OPENAI_API_KEY

    @property
    def active_stt_key(self) -> str:
        if self.STT_API_KEY and self.STT_API_KEY != "your_openai_or_deepgram_api_key_here":
            return self.STT_API_KEY
        if self.STT_PROVIDER.lower() == "deepgram" and self.DEEPGRAM_API_KEY:
            return self.DEEPGRAM_API_KEY
        return self.OPENAI_API_KEY

    @property
    def active_tts_key(self) -> str:
        if self.TTS_API_KEY and self.TTS_API_KEY != "your_openai_or_tts_api_key_here":
            return self.TTS_API_KEY
        if self.TTS_PROVIDER.lower() == "elevenlabs" and self.ELEVENLABS_API_KEY:
            return self.ELEVENLABS_API_KEY
        if self.TTS_PROVIDER.lower() == "deepgram" and self.DEEPGRAM_API_KEY:
            return self.DEEPGRAM_API_KEY
        return self.OPENAI_API_KEY


settings = Settings()

