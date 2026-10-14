import asyncio
import logging
from typing import List
from app.config import settings
from app.core.exceptions import CourseCompassException
from app.rag.embeddings.base import BaseEmbeddingProvider

logger = logging.getLogger("coursecompass.embeddings.gemini")


class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    """
    Official Google Gemini dense embedding provider using text-embedding-004 (768 dimensions).
    """

    def __init__(self, api_key: str = "", model_name: str = "text-embedding-004"):
        self._api_key = api_key or settings.GEMINI_API_KEY
        self._model_name = model_name
        self._dim = 768

    @property
    def dimension(self) -> int:
        return self._dim

    @property
    def model_name(self) -> str:
        return self._model_name

    async def embed_query(self, text: str) -> List[float]:
        results = await self.embed_documents([text])
        return results[0] if results else [0.0] * self._dim

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not self._api_key:
            raise CourseCompassException(
                "Gemini API key is required for GeminiEmbeddingProvider",
                status_code=500,
                details={"code": "MISSING_GEMINI_API_KEY"}
            )

        # Use google-genai SDK or REST API
        try:
            from google import genai
            client = genai.Client(api_key=self._api_key)

            def _call_batch():
                # text-embedding-004 batch embedding
                response = client.models.embed_content(
                    model=self._model_name,
                    contents=texts
                )
                if hasattr(response, "embeddings"):
                    return [e.values for e in response.embeddings]
                elif hasattr(response, "embedding"):
                    return [response.embedding.values]
                return [[0.0] * self._dim for _ in texts]

            return await asyncio.to_thread(_call_batch)
        except Exception as e:
            logger.warning("Gemini embedding call failed: %s; falling back to deterministic local", e)
            from app.rag.embeddings.deterministic import DeterministicLocalEmbeddingProvider
            fallback = DeterministicLocalEmbeddingProvider(dimension=self._dim)
            return await fallback.embed_documents(texts)

