from typing import List
from app.schemas.protocol import CanvasContextPayload


class RAGService:
    """
    Curriculum & Knowledge Retrieval Service (RAG).
    Ready to connect to Supabase pgvector / Qdrant for subject-specific retrieval.
    """

    async def retrieve_context(
        self, query: str, canvas_context: CanvasContextPayload
    ) -> List[str]:
        return []


rag_service = RAGService()
