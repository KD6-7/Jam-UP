"""Semantic prompt-injection firewall (Day 4).

Embeds the incoming prompt and compares it, by cosine similarity, against a
seeded index of known injection phrasings. If the best match exceeds the
configured threshold the request is blocked.

Two embedders are provided:

* ``SentenceTransformerEmbedder`` — uses ``sentence-transformers`` /
  ``all-MiniLM-L6-v2`` when installed, for real semantic matching.
* ``BagOfWordsEmbedder`` — a dependency-free fallback (term-frequency cosine)
  so the guardrail still functions, and the tests still run, on a machine with
  no ML stack. It catches near-duplicate phrasings rather than paraphrases.

``get_embedder`` picks the best available one.
"""

from __future__ import annotations

import math
import re
from typing import Dict, List, Sequence, Tuple

_WORD_RE = re.compile(r"[a-z0-9']+")


class BaseEmbedder:
    kind = "base"

    def embed(self, text: str):  # pragma: no cover - interface
        raise NotImplementedError

    def similarity(self, a, b) -> float:  # pragma: no cover - interface
        raise NotImplementedError


class BagOfWordsEmbedder(BaseEmbedder):
    """Dependency-free term-frequency vectors with sparse cosine similarity."""

    kind = "bag-of-words"

    def embed(self, text: str) -> Dict[str, float]:
        counts: Dict[str, float] = {}
        for word in _WORD_RE.findall(text.lower()):
            counts[word] = counts.get(word, 0.0) + 1.0
        return counts

    def similarity(self, a: Dict[str, float], b: Dict[str, float]) -> float:
        if not a or not b:
            return 0.0
        # Iterate the smaller dict for the dot product.
        small, large = (a, b) if len(a) <= len(b) else (b, a)
        dot = sum(weight * large.get(term, 0.0) for term, weight in small.items())
        if dot == 0.0:
            return 0.0
        norm_a = math.sqrt(sum(v * v for v in a.values()))
        norm_b = math.sqrt(sum(v * v for v in b.values()))
        return dot / (norm_a * norm_b)


class SentenceTransformerEmbedder(BaseEmbedder):
    """Dense embeddings via sentence-transformers, if available."""

    kind = "sentence-transformers"

    def __init__(self, model_name: str = "all-MiniLM-L6-v2") -> None:
        from sentence_transformers import SentenceTransformer  # lazy import

        self._model = SentenceTransformer(model_name)

    def embed(self, text: str) -> List[float]:
        vector = self._model.encode(text, normalize_embeddings=True)
        return [float(x) for x in vector]

    def similarity(self, a: Sequence[float], b: Sequence[float]) -> float:
        # Vectors are L2-normalised, so dot product == cosine similarity.
        return float(sum(x * y for x, y in zip(a, b)))


def get_embedder(model_name: str = "all-MiniLM-L6-v2", prefer_semantic: bool = True) -> BaseEmbedder:
    if prefer_semantic:
        try:
            return SentenceTransformerEmbedder(model_name)
        except Exception:
            # Model or library unavailable; fall back silently.
            pass
    return BagOfWordsEmbedder()


class InjectionGuard:
    """Scores prompts against a seeded index of injection phrasings."""

    def __init__(
        self,
        embedder: BaseEmbedder,
        seeds: List[str],
        threshold: float = 0.85,
    ) -> None:
        self.embedder = embedder
        self.threshold = threshold
        self._seeds: List[str] = list(seeds)
        self._vectors = [embedder.embed(s) for s in self._seeds]

    @property
    def backend(self) -> str:
        return self.embedder.kind

    def score(self, text: str) -> Tuple[float, str]:
        """Return (best_similarity, best_matching_seed) for ``text``."""
        if not text.strip() or not self._vectors:
            return 0.0, ""
        query = self.embedder.embed(text)
        best_score = 0.0
        best_seed = ""
        for seed, vector in zip(self._seeds, self._vectors):
            score = self.embedder.similarity(query, vector)
            if score > best_score:
                best_score = score
                best_seed = seed
        return best_score, best_seed

    def is_injection(self, text: str) -> bool:
        score, _ = self.score(text)
        return score >= self.threshold
