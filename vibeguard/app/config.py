"""Runtime configuration, sourced from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from typing import List, Optional


def _flag(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() not in ("0", "false", "no", "off", "")


@dataclass
class Settings:
    # Upstream LLM provider (OpenAI-compatible).
    upstream_base_url: str = os.getenv("VIBEGUARD_UPSTREAM_URL", "https://api.openai.com")
    upstream_api_key: Optional[str] = os.getenv("VIBEGUARD_UPSTREAM_API_KEY")
    upstream_timeout: float = float(os.getenv("VIBEGUARD_UPSTREAM_TIMEOUT", "60"))

    # Token store.
    redis_url: Optional[str] = os.getenv("VIBEGUARD_REDIS_URL") or None
    token_ttl_seconds: int = int(os.getenv("VIBEGUARD_TOKEN_TTL", "600"))

    # Semantic guardrail.
    enable_semantic_guard: bool = _flag("VIBEGUARD_ENABLE_SEMANTIC", True)
    prefer_semantic_model: bool = _flag("VIBEGUARD_PREFER_ST_MODEL", True)
    embedding_model: str = os.getenv("VIBEGUARD_EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    injection_threshold: float = float(os.getenv("VIBEGUARD_INJECTION_THRESHOLD", "0.85"))

    # Rate limiting.
    rate_limit_enabled: bool = _flag("VIBEGUARD_RATE_LIMIT", False)
    rate_limit_capacity: int = int(os.getenv("VIBEGUARD_RATE_LIMIT_CAPACITY", "60"))
    rate_limit_refill_per_sec: float = float(os.getenv("VIBEGUARD_RATE_LIMIT_REFILL", "1"))

    @property
    def blocklist(self) -> List[str]:
        raw = os.getenv("VIBEGUARD_BLOCKLIST", "")
        return [term.strip() for term in raw.split(",") if term.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
