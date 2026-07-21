"""Inbound/outbound orchestration that ties the pieces together.

Inbound:  mask PII in every message -> store the mapping under a session id ->
          score the original user text for prompt injection.
Outbound: rehydrate ``[REDACTED_*]`` tokens using the stored mapping (whole
          body for non-streaming; boundary-safe for streaming).
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from .masking import Masker, rehydrate_text
from .semantic import InjectionGuard


class InjectionBlocked(Exception):
    def __init__(self, score: float, seed: str, threshold: float, backend: str) -> None:
        super().__init__("prompt injection detected")
        self.score = score
        self.seed = seed
        self.threshold = threshold
        self.backend = backend


@dataclass
class PreparedRequest:
    session_id: str
    payload: Dict[str, Any]
    mapping: Dict[str, str]
    injection_score: float
    matched_seed: str


def _extract_message_texts(messages: List[Dict[str, Any]]) -> List[Tuple[int, str]]:
    """Return (index, text) for messages whose content is a plain string."""
    out: List[Tuple[int, str]] = []
    for i, msg in enumerate(messages):
        content = msg.get("content")
        if isinstance(content, str) and content:
            out.append((i, content))
    return out


def _user_text(messages: List[Dict[str, Any]]) -> str:
    parts = [
        msg.get("content", "")
        for msg in messages
        if msg.get("role") == "user" and isinstance(msg.get("content"), str)
    ]
    return "\n".join(parts)


def prepare_request(
    payload: Dict[str, Any],
    masker: Masker,
    guard: Optional[InjectionGuard],
) -> PreparedRequest:
    """Mask PII and run the injection check. Raises ``InjectionBlocked``."""
    messages: List[Dict[str, Any]] = payload.get("messages", []) or []

    # Injection check runs on the original (pre-masking) user text.
    injection_score = 0.0
    matched_seed = ""
    if guard is not None:
        injection_score, matched_seed = guard.score(_user_text(messages))
        if injection_score >= guard.threshold:
            raise InjectionBlocked(
                injection_score, matched_seed, guard.threshold, guard.backend
            )

    indexed = _extract_message_texts(messages)
    masked_texts, mapping = masker.mask_batch([text for _, text in indexed])

    # Rebuild the payload with masked message content.
    new_messages = [dict(m) for m in messages]
    for (idx, _original), masked in zip(indexed, masked_texts):
        new_messages[idx]["content"] = masked
    new_payload = dict(payload)
    new_payload["messages"] = new_messages

    return PreparedRequest(
        session_id=uuid.uuid4().hex,
        payload=new_payload,
        mapping=mapping,
        injection_score=injection_score,
        matched_seed=matched_seed,
    )


def rehydrate_response_body(body: Dict[str, Any], mapping: Dict[str, str]) -> Dict[str, Any]:
    """Rehydrate tokens in a non-streaming chat completion response."""
    if not mapping:
        return body
    for choice in body.get("choices", []) or []:
        message = choice.get("message")
        if isinstance(message, dict) and isinstance(message.get("content"), str):
            message["content"] = rehydrate_text(message["content"], mapping)
        # Some providers echo a `text` field.
        if isinstance(choice.get("text"), str):
            choice["text"] = rehydrate_text(choice["text"], mapping)
    return body
