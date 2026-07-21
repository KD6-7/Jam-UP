"""Inbound/outbound orchestration that ties the pieces together.

Inbound:  mask PII in every message (string *and* structured/multimodal text
          parts) -> store the mapping under a session id -> score every
          attacker-controllable text piece for prompt injection.
Outbound: rehydrate ``[REDACTED_*]`` tokens using the mapping (whole body for
          non-streaming; boundary-safe for streaming).
"""

from __future__ import annotations

import copy
import uuid
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from .masking import Masker, rehydrate_text
from .semantic import InjectionGuard

# Roles whose content is attacker-controllable and therefore worth screening
# for prompt injection. The app's own ``system`` prompt is trusted and excluded
# so a legitimately instruction-heavy system message isn't self-blocked.
GUARDED_ROLES = frozenset({"user", "tool", "function"})

# (message_index, part_index_or_None, text)
_TextSlot = Tuple[int, Optional[int], str]


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


def _message_text_pieces(msg: Dict[str, Any]) -> List[str]:
    """Every plain-string text carried by a message (top-level or structured)."""
    content = msg.get("content")
    if isinstance(content, str):
        return [content] if content else []
    pieces: List[str] = []
    if isinstance(content, list):
        for part in content:
            if isinstance(part, dict) and isinstance(part.get("text"), str) and part["text"]:
                pieces.append(part["text"])
    return pieces


def _collect_text_slots(messages: List[Dict[str, Any]]) -> List[_TextSlot]:
    """Locate every maskable text, whether string content or a structured part."""
    slots: List[_TextSlot] = []
    for mi, msg in enumerate(messages):
        content = msg.get("content")
        if isinstance(content, str):
            if content:
                slots.append((mi, None, content))
        elif isinstance(content, list):
            for pi, part in enumerate(content):
                if isinstance(part, dict) and isinstance(part.get("text"), str) and part["text"]:
                    slots.append((mi, pi, part["text"]))
    return slots


def _screen_for_injection(messages: List[Dict[str, Any]], guard: InjectionGuard) -> Tuple[float, str]:
    """Score each guarded text piece independently; raise on the first hit.

    Scoring per-piece (rather than one concatenated blob) keeps the signal
    sharp — a short injection buried in a long transcript would otherwise be
    diluted below the cosine threshold.
    """
    best_score = 0.0
    best_seed = ""
    for msg in messages:
        if msg.get("role") not in GUARDED_ROLES:
            continue
        for piece in _message_text_pieces(msg):
            score, seed = guard.score(piece)
            if score > best_score:
                best_score, best_seed = score, seed
            if score >= guard.threshold:
                raise InjectionBlocked(score, seed, guard.threshold, guard.backend)
    return best_score, best_seed


def prepare_request(
    payload: Dict[str, Any],
    masker: Masker,
    guard: Optional[InjectionGuard],
) -> PreparedRequest:
    """Mask PII and run the injection check. Raises ``InjectionBlocked``."""
    messages: List[Dict[str, Any]] = payload.get("messages", []) or []

    # Injection check on the original (pre-masking) attacker-controllable text.
    injection_score = 0.0
    matched_seed = ""
    if guard is not None:
        injection_score, matched_seed = _screen_for_injection(messages, guard)

    # Deep-copy so structured (nested) content can be rewritten without touching
    # the caller's payload.
    new_messages = copy.deepcopy(messages)
    slots = _collect_text_slots(new_messages)
    masked_texts, mapping = masker.mask_batch([text for _, _, text in slots])
    for (mi, pi, _original), masked in zip(slots, masked_texts):
        if pi is None:
            new_messages[mi]["content"] = masked
        else:
            new_messages[mi]["content"][pi]["text"] = masked

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
