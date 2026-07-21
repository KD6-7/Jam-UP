"""Deterministic PII masking engine (Day 2).

Combines regular expressions (structured PII: emails, keys, cards, ...) with an
Aho-Corasick pass over a caller-supplied blocklist (named entities, project
codenames, etc.). Matches are replaced with stable ``[REDACTED_<TYPE>_<n>]``
tokens, and the token -> original mapping is returned so the outbound pass can
rehydrate the response.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List, Tuple

from .aho_corasick import AhoCorasick

# (type, compiled pattern). Order is informational only; overlap resolution
# below prefers the earliest-starting, then longest, match.
PATTERNS: List[Tuple[str, "re.Pattern[str]"]] = [
    ("API_KEY", re.compile(r"\b(?:sk|pk|rk)-[A-Za-z0-9_\-]{16,}\b")),
    ("API_KEY", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("EMAIL", re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b")),
    ("SSN", re.compile(r"\b\d{3}-\d{2}-\d{4}\b")),
    ("CREDIT_CARD", re.compile(r"\b(?:\d[ \-]?){13,19}\b")),
    (
        "PHONE",
        re.compile(
            r"(?<!\d)(?:\+?1[ .\-]?)?(?:\(\d{3}\)|\d{3})[ .\-]?\d{3}[ .\-]?\d{4}(?!\d)"
        ),
    ),
    (
        "IPV4",
        re.compile(
            r"\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b"
        ),
    ),
]

# A raw span found in the text before token assignment.
_Span = Tuple[int, int, str, str]  # (start, end, type, value)


@dataclass
class MaskResult:
    """Result of masking one or more texts."""

    text: str
    mapping: Dict[str, str] = field(default_factory=dict)


class _State:
    """Shared token-assignment state so repeated values map to the same token
    across every message in a single request."""

    def __init__(self) -> None:
        self.value_to_token: Dict[str, str] = {}
        self.counters: Dict[str, int] = {}
        self.mapping: Dict[str, str] = {}

    def token_for(self, kind: str, value: str) -> str:
        token = self.value_to_token.get(value)
        if token is None:
            self.counters[kind] = self.counters.get(kind, 0) + 1
            token = "[REDACTED_{0}_{1}]".format(kind, self.counters[kind])
            self.value_to_token[value] = token
            self.mapping[token] = value
        return token


class Masker:
    """Detects and masks PII. Construct once and reuse across requests."""

    def __init__(self, blocklist: List[str] = None, blocklist_type: str = "ENTITY") -> None:
        self.blocklist_type = blocklist_type
        self._ac = AhoCorasick(blocklist or [])
        self._has_blocklist = bool(blocklist)

    def mask(self, text: str) -> MaskResult:
        masked, mapping = self.mask_batch([text])
        return MaskResult(masked[0], mapping)

    def mask_batch(self, texts: List[str]) -> Tuple[List[str], Dict[str, str]]:
        state = _State()
        out = [self._mask_one(t, state) for t in texts]
        return out, state.mapping

    def _mask_one(self, text: str, state: _State) -> str:
        spans = self._collect_spans(text)
        spans = self._resolve_overlaps(spans)
        # Replace right-to-left so earlier offsets stay valid.
        replacements = [
            (start, end, state.token_for(kind, value))
            for (start, end, kind, value) in spans
        ]
        result = text
        for start, end, token in sorted(replacements, key=lambda r: r[0], reverse=True):
            result = result[:start] + token + result[end:]
        return result

    def _collect_spans(self, text: str) -> List[_Span]:
        spans: List[_Span] = []
        for kind, pattern in PATTERNS:
            for match in pattern.finditer(text):
                spans.append((match.start(), match.end(), kind, match.group()))
        if self._has_blocklist:
            for start, end, _pattern in self._ac.find(text):
                if self._on_word_boundary(text, start, end):
                    spans.append((start, end, self.blocklist_type, text[start:end]))
        return spans

    @staticmethod
    def _on_word_boundary(text: str, start: int, end: int) -> bool:
        before = text[start - 1] if start > 0 else " "
        after = text[end] if end < len(text) else " "
        return not (before.isalnum() or after.isalnum())

    @staticmethod
    def _resolve_overlaps(spans: List[_Span]) -> List[_Span]:
        # Prefer earliest start, then the longest span at that start.
        ordered = sorted(spans, key=lambda s: (s[0], -(s[1] - s[0])))
        chosen: List[_Span] = []
        last_end = -1
        for span in ordered:
            if span[0] >= last_end:
                chosen.append(span)
                last_end = span[1]
        return chosen


def rehydrate_text(text: str, mapping: Dict[str, str]) -> str:
    """Replace ``[REDACTED_*]`` tokens with their original values.

    Longest tokens first so a token is never a prefix-collision of another.
    """
    if not mapping or not text:
        return text
    for token in sorted(mapping, key=len, reverse=True):
        if token in text:
            text = text.replace(token, mapping[token])
    return text
