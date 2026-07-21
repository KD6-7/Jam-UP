"""Request/response models for the proxy surface."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    # OpenAI allows string or structured content; we only mask string content.
    content: Optional[Any] = None

    model_config = {"extra": "allow"}


class ChatCompletionRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    stream: bool = False

    model_config = {"extra": "allow"}


class GuardInfo(BaseModel):
    blocked: bool = False
    reason: Optional[str] = None
    score: Optional[float] = None
    matched_seed: Optional[str] = None
    threshold: Optional[float] = None
    backend: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
    token_store: str
    semantic_backend: str
    semantic_enabled: bool
