import base64
import io
import httpx
from openai import AsyncOpenAI
from app.core.config import settings


class STTService:
    """
    Streaming / Segment-Based ASR Service.
    Supports OpenAI Whisper, Groq Whisper-large-v3-turbo, and Deepgram Nova-2.
    Configured via backend/.env (STT_PROVIDER, STT_API_KEY, STT_MODEL_NAME).
    """

    def __init__(self):
        self.provider = settings.STT_PROVIDER.lower()
        self.model = settings.STT_MODEL_NAME
        self.language = settings.STT_LANGUAGE
        self._http = httpx.AsyncClient(timeout=10.0)
        self._openai_client = None
        self._groq_client = None

    async def transcribe_bytes(
        self, audio_bytes: bytes, mime_type: str = "audio/webm"
    ) -> str:
        if not audio_bytes or len(audio_bytes) < 200:
            return ""

        # 1. Deepgram Nova-2 Ultra-Low Latency ASR
        if self.provider == "deepgram":
            api_key = settings.active_stt_key
            if not api_key:
                raise ValueError("Missing DEEPGRAM_API_KEY or STT_API_KEY in .env")

            clean_mime = (mime_type or "audio/webm").split(";")[0].strip()
            url = (
                f"https://api.deepgram.com/v1/listen"
                f"?model={self.model}&language={self.language}&smart_format=true&punctuate=true"
            )
            headers = {
                "Authorization": f"Token {api_key}",
                "Content-Type": clean_mime,
            }
            resp = await self._http.post(url, content=audio_bytes, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            channels = data.get("results", {}).get("channels", [])
            if channels and channels[0].get("alternatives"):
                return channels[0]["alternatives"][0].get("transcript", "").strip()
            return ""

        # 2. Groq Whisper ASR (whisper-large-v3-turbo)
        if self.provider == "groq":
            api_key = settings.GROQ_API_KEY or settings.active_stt_key
            if self._groq_client is None:
                self._groq_client = AsyncOpenAI(
                    api_key=api_key, base_url="https://api.groq.com/openai/v1"
                )
            ext = "webm" if "webm" in mime_type else "wav"
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = f"speech.{ext}"
            transcript = await self._groq_client.audio.transcriptions.create(
                model=self.model or "whisper-large-v3-turbo",
                file=audio_file,
                language=self.language,
            )
            return transcript.text.strip()

        # 3. Default: OpenAI Whisper (whisper-1 / gpt-4o-mini-transcribe)
        api_key = settings.active_stt_key
        if not api_key or api_key == "your_openai_api_key_here":
            raise ValueError("Please set your OPENAI_API_KEY or STT_API_KEY in backend/.env")

        if self._openai_client is None:
            self._openai_client = AsyncOpenAI(api_key=api_key)
        ext = "webm" if "webm" in mime_type else "wav"
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = f"speech.{ext}"
        transcript = await self._openai_client.audio.transcriptions.create(
            model=self.model or "whisper-1",
            file=audio_file,
            language=self.language,
        )
        return transcript.text.strip()

    async def transcribe_audio_base64(
        self, audio_base64: str, mime_type: str = "audio/webm"
    ) -> str:
        if not audio_base64:
            return ""
        audio_bytes = base64.b64decode(audio_base64)
        return await self.transcribe_bytes(audio_bytes, mime_type)


stt_service = STTService()

