"""Runtime configuration, sourced from environment variables.

Env is read in :meth:`Settings.from_env`, i.e. when the settings object is
*instantiated* (at app startup), not at import time. This matters: dataclass
field defaults that call ``os.getenv`` would be evaluated once when the module
is first imported, freezing the config and ignoring any env set afterwards.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
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
    upstream_base_url: str = "https://api.openai.com"
    upstream_api_key: Optional[str] = None
    upstream_timeout: float = 60.0

    # Token store.
    redis_url: Optional[str] = None
    token_ttl_seconds: int = 600

    # Semantic guardrail.
    enable_semantic_guard: bool = True
    prefer_semantic_model: bool = True
    embedding_model: str = "all-MiniLM-L6-v2"
    injection_threshold: float = 0.85

    # Rate limiting.
    rate_limit_enabled: bool = False
    rate_limit_capacity: int = 60
    rate_limit_refill_per_sec: float = 1.0

    # Custom PII blocklist (named entities).
    blocklist: List[str] = field(default_factory=list)

    @classmethod
    def from_env(cls) -> "Settings":
        raw_blocklist = os.getenv("VIBEGUARD_BLOCKLIST", "")
        return cls(
            upstream_base_url=os.getenv("VIBEGUARD_UPSTREAM_URL", "https://api.openai.com"),
            upstream_api_key=os.getenv("VIBEGUARD_UPSTREAM_API_KEY") or None,
            upstream_timeout=float(os.getenv("VIBEGUARD_UPSTREAM_TIMEOUT", "60")),
            redis_url=os.getenv("VIBEGUARD_REDIS_URL") or None,
            token_ttl_seconds=int(os.getenv("VIBEGUARD_TOKEN_TTL", "600")),
            enable_semantic_guard=_flag("VIBEGUARD_ENABLE_SEMANTIC", True),
            prefer_semantic_model=_flag("VIBEGUARD_PREFER_ST_MODEL", True),
            embedding_model=os.getenv("VIBEGUARD_EMBEDDING_MODEL", "all-MiniLM-L6-v2"),
            injection_threshold=float(os.getenv("VIBEGUARD_INJECTION_THRESHOLD", "0.85")),
            rate_limit_enabled=_flag("VIBEGUARD_RATE_LIMIT", False),
            rate_limit_capacity=int(os.getenv("VIBEGUARD_RATE_LIMIT_CAPACITY", "60")),
            rate_limit_refill_per_sec=float(os.getenv("VIBEGUARD_RATE_LIMIT_REFILL", "1")),
            blocklist=[term.strip() for term in raw_blocklist.split(",") if term.strip()],
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings.from_env()
