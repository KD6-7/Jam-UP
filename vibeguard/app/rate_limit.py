"""Token-bucket rate limiter (core feature).

An in-memory token bucket keyed by client identity (API key or IP). Protects
the downstream LLM quota. Kept in-process for simplicity; a Redis-backed
variant would swap the bucket storage for an atomic Lua script.
"""

from __future__ import annotations

import time
from typing import Dict, Tuple


class TokenBucket:
    def __init__(self, capacity: int = 60, refill_per_sec: float = 1.0) -> None:
        self.capacity = float(capacity)
        self.refill_per_sec = float(refill_per_sec)
        # key -> (tokens, last_refill_ts)
        self._buckets: Dict[str, Tuple[float, float]] = {}

    def allow(self, key: str, cost: float = 1.0) -> bool:
        now = time.monotonic()
        tokens, last = self._buckets.get(key, (self.capacity, now))
        tokens = min(self.capacity, tokens + (now - last) * self.refill_per_sec)
        if tokens >= cost:
            self._buckets[key] = (tokens - cost, now)
            return True
        self._buckets[key] = (tokens, now)
        return False

    def remaining(self, key: str) -> int:
        tokens, _ = self._buckets.get(key, (self.capacity, time.monotonic()))
        return int(tokens)
