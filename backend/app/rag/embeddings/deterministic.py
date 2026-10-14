import hashlib
import math
import re
from typing import List
from app.rag.embeddings.base import BaseEmbeddingProvider


class DeterministicLocalEmbeddingProvider(BaseEmbeddingProvider):
    """
    Zero-dependency deterministic embedding provider.
    Uses subword hashing and feature projection into a normalized 768-dimensional space.
    Guarantees reproducible cosine similarity for testing and offline development.
    """

    def __init__(self, dimension: int = 768):
        self._dim = dimension
        self._model_name = "deterministic-hash-768"

    @property
    def dimension(self) -> int:
        return self._dim

    @property
    def model_name(self) -> str:
        return self._model_name

    def _embed(self, text: str) -> List[float]:
        vec = [0.0] * self._dim
        if not text:
            return vec

        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        tokens = [t for t in cleaned.split() if t]
        if not tokens:
            return vec

        # Bag of words and character tri-grams
        features: List[tuple[str, float]] = []
        for t in tokens:
            features.append((t, 2.0))  # Full words get higher weight
            if len(t) >= 4:
                for i in range(len(t) - 2):
                    features.append((t[i:i+3], 0.5))

        for feat, weight in features:
            h = hashlib.sha256(feat.encode("utf-8")).digest()
            idx = int.from_bytes(h[:4], "big") % self._dim
            sign = 1.0 if (h[4] % 2 == 0) else -1.0
            vec[idx] += sign * weight

        # L2 unit normalization
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 1e-9:
            vec = [x / norm for x in vec]

        return vec

    async def embed_query(self, text: str) -> List[float]:
        return self._embed(text)

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed(t) for t in texts]

