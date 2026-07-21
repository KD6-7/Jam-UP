"""Stateful token mapping store (Day 3).

Persists the per-request ``token -> original value`` map under a session id with
a short TTL (data minimisation). Backed by Redis when a URL is configured and
``redis`` is importable; otherwise an in-memory dict with lazy expiry so the
proxy still runs on a machine with no Redis.

Scope note: in the current single-request proxy flow, one request handles
mask -> forward -> rehydrate, so the outbound pass rehydrates from the mapping
already held in memory and does **not** read this store back. The store is
therefore used for (a) TTL-bounded auditability of what was redacted and
(b) enabling a future *separate* demask endpoint or multi-process deployment
where inbound and outbound happen in different requests. ``load()`` exists for
that path (and is covered by tests) even though the hot path doesn't call it.

Both implementations expose the same async interface.
"""

from __future__ import annotations

import time
from typing import Dict, Optional, Tuple


class InMemoryTokenStore:
    """Async-compatible in-memory store with per-key expiry."""

    def __init__(self, default_ttl: int = 600) -> None:
        self.default_ttl = default_ttl
        self._data: Dict[str, Tuple[float, Dict[str, str]]] = {}

    async def save(self, session_id: str, mapping: Dict[str, str], ttl: Optional[int] = None) -> None:
        if not mapping:
            return
        expiry = time.monotonic() + (ttl if ttl is not None else self.default_ttl)
        self._data[session_id] = (expiry, dict(mapping))

    async def load(self, session_id: str) -> Dict[str, str]:
        self._purge()
        entry = self._data.get(session_id)
        if entry is None:
            return {}
        expiry, mapping = entry
        if expiry < time.monotonic():
            self._data.pop(session_id, None)
            return {}
        return dict(mapping)

    async def delete(self, session_id: str) -> None:
        self._data.pop(session_id, None)

    async def close(self) -> None:
        self._data.clear()

    def _purge(self) -> None:
        now = time.monotonic()
        expired = [k for k, (exp, _) in self._data.items() if exp < now]
        for key in expired:
            self._data.pop(key, None)


class RedisTokenStore:
    """Redis-backed store using a hash per session with an expiry."""

    def __init__(self, client, default_ttl: int = 600, prefix: str = "vibeguard:map:") -> None:
        self._client = client
        self.default_ttl = default_ttl
        self.prefix = prefix

    def _key(self, session_id: str) -> str:
        return self.prefix + session_id

    async def save(self, session_id: str, mapping: Dict[str, str], ttl: Optional[int] = None) -> None:
        if not mapping:
            return
        key = self._key(session_id)
        await self._client.hset(key, mapping=mapping)
        await self._client.expire(key, ttl if ttl is not None else self.default_ttl)

    async def load(self, session_id: str) -> Dict[str, str]:
        raw = await self._client.hgetall(self._key(session_id))
        if not raw:
            return {}
        return {_as_str(k): _as_str(v) for k, v in raw.items()}

    async def delete(self, session_id: str) -> None:
        await self._client.delete(self._key(session_id))

    async def close(self) -> None:
        try:
            await self._client.aclose()
        except AttributeError:  # older redis-py
            await self._client.close()


def _as_str(value) -> str:
    return value.decode() if isinstance(value, (bytes, bytearray)) else value


def get_token_store(redis_url: Optional[str], default_ttl: int = 600):
    """Return a Redis-backed store if possible, else an in-memory one."""
    if redis_url:
        try:
            import redis.asyncio as aioredis  # lazy import

            client = aioredis.from_url(redis_url, decode_responses=True)
            return RedisTokenStore(client, default_ttl=default_ttl)
        except Exception:
            pass
    return InMemoryTokenStore(default_ttl=default_ttl)
