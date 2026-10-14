from typing import Optional
from app.config import settings
from app.rag.embeddings.base import BaseEmbeddingProvider
from app.rag.embeddings.deterministic import DeterministicLocalEmbeddingProvider
from app.rag.embeddings.gemini import GeminiEmbeddingProvider

_global_provider: Optional[BaseEmbeddingProvider] = None


def get_embedding_provider() -> BaseEmbeddingProvider:
    """
    Returns the configured embedding provider.
    Defaults to Gemini if API key is present and not testing; otherwise deterministic local.
    """
    global _global_provider
    if _global_provider is not None:
        return _global_provider

    if settings.GEMINI_API_KEY and settings.ENVIRONMENT.lower() == "production":
        return GeminiEmbeddingProvider(api_key=settings.GEMINI_API_KEY)
    
    return DeterministicLocalEmbeddingProvider(dimension=768)


def set_embedding_provider(provider: Optional[BaseEmbeddingProvider]) -> None:
    """Allows overriding embedding provider in test suites or local staging."""
    global _global_provider
    _global_provider = provider

