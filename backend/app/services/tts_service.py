import base64
import httpx
from openai import AsyncOpenAI
from app.core.config import settings
from app.services.clause_chunker import sanitize_spoken_text


class TTSService:
    """
    Incremental Neural TTS Synthesis Service.
    Synthesizes individual clause chunks (y_k) in real time so audio playback starts
    within ~200ms while the LLM is still generating subsequent clauses.
    Supports OpenAI TTS (tts-1), Deepgram Aura, and ElevenLabs Turbo v2.5.
    """

    def __init__(self):
        self.provider = settings.TTS_PROVIDER.lower()
        self.model = settings.TTS_MODEL_NAME
        self.voice_id = settings.TTS_VOICE_ID
        # Reused clients keep TCP/TLS connections warm (no handshake per clause)
        self._http = httpx.AsyncClient(timeout=15.0)
        self._openai_client = None

    async def synthesize_clause_base64(self, text: str) -> str:
        """
        Synthesizes a single clause chunk and returns base64-encoded MP3/audio bytes
        ready for immediate client AudioContext decoding & playback.
        """
        clean_text = sanitize_spoken_text(text)
        if not clean_text:
            return ""

        # 1. Deepgram Aura Low-Latency TTS
        if self.provider == "deepgram":
            api_key = settings.active_tts_key
            if not api_key:
                raise ValueError("Missing DEEPGRAM_API_KEY or TTS_API_KEY in .env")
            url = (
                f"https://api.deepgram.com/v1/speak"
                f"?model={self.model or 'aura-asteria-en'}&encoding=mp3"
            )
            headers = {
                "Authorization": f"Token {api_key}",
                "Content-Type": "application/json",
            }
            resp = await self._http.post(url, json={"text": clean_text}, headers=headers)
            resp.raise_for_status()
            return base64.b64encode(resp.content).decode("utf-8")

        # 2. ElevenLabs Turbo v2.5 Low-Latency TTS
        if self.provider == "elevenlabs":
            api_key = settings.active_tts_key
            if not api_key:
                raise ValueError("Missing ELEVENLABS_API_KEY or TTS_API_KEY in .env")
            voice = self.voice_id or "21m00Tcm4TlvDq8ikWAM"
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?optimize_streaming_latency=3"
            headers = {
                "xi-api-key": api_key,
                "Content-Type": "application/json",
            }
            payload = {
                "text": clean_text,
                "model_id": self.model or "eleven_turbo_v2_5",
            }
            resp = await self._http.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            return base64.b64encode(resp.content).decode("utf-8")

        # 3. Default: OpenAI Neural TTS (tts-1)
        api_key = settings.active_tts_key
        if not api_key or api_key == "your_openai_api_key_here":
            raise ValueError("Please set your OPENAI_API_KEY or TTS_API_KEY in backend/.env")

        if self._openai_client is None:
            self._openai_client = AsyncOpenAI(api_key=api_key)
        response = await self._openai_client.audio.speech.create(
            model=self.model or "tts-1",
            voice=self.voice_id or "alloy",
            input=clean_text,
            response_format="mp3",
        )
        audio_bytes = response.content
        return base64.b64encode(audio_bytes).decode("utf-8")


tts_service = TTSService()

