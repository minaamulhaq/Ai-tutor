# ZuhDemy Real-Time AI Tutor Backend (`uv`)

Low-latency Voice + Canvas synchronization backend built with FastAPI and managed via `uv`.

## Quick Start with `uv`

1. Configure your API keys in `.env`:
   ```env
   OPENAI_API_KEY=sk-...
   ```

2. Create the `.venv` and install dependencies automatically with `uv`:
   ```bash
   cd backend
   uv sync
   ```

3. Start the FastAPI server inside the `uv` virtual environment:
   ```bash
   uv run dev
   ```
   *(Or run `uv run uvicorn app.main:app --reload --port 8000`)*

