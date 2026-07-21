"""Streaming rehydration (Day 5).

Two rehydrators:

* ``StreamRehydrator`` — for a raw text stream. Rehydrates ``[REDACTED_*]``
  tokens even when a token is split across chunk boundaries, by holding back a
  tail of the buffer (the longest possible token minus one) until it is certain
  a token there is complete.

* ``SSERehydrator`` — for an OpenAI-style Server-Sent Events stream, where the
  assistant text is chunked into separate ``data: {json}`` frames so a token is
  *not* contiguous in the byte stream. It parses each frame, funnels the
  ``delta.content`` text through a ``StreamRehydrator``, and re-emits frames.
"""

from __future__ import annotations

import json
from typing import Dict, Iterator

from .masking import rehydrate_text


class StreamRehydrator:
    """Feed decoded text chunks in; get rehydrated text out, boundary-safe."""

    def __init__(self, mapping: Dict[str, str]) -> None:
        self._mapping = mapping or {}
        self._buffer = ""
        # Longest token length determines how much tail we must hold back.
        self._max_token_len = max((len(t) for t in self._mapping), default=0)

    def feed(self, chunk: str) -> str:
        if not chunk:
            return ""
        self._buffer += chunk
        if not self._mapping:
            out, self._buffer = self._buffer, ""
            return out
        # Keep a tail that could still be the start of a split token.
        keep = self._max_token_len - 1
        if keep <= 0 or len(self._buffer) <= keep:
            return ""
        cut = len(self._buffer) - keep
        # Do not split in the middle of a token that is already complete: back
        # the cut up to the last unambiguous boundary ('[' starts every token).
        safe_cut = cut
        open_bracket = self._buffer.rfind("[", 0, cut)
        if open_bracket != -1 and "]" not in self._buffer[open_bracket:cut]:
            safe_cut = open_bracket
        if safe_cut <= 0:
            return ""
        emit, self._buffer = self._buffer[:safe_cut], self._buffer[safe_cut:]
        return rehydrate_text(emit, self._mapping)

    def flush(self) -> str:
        out = rehydrate_text(self._buffer, self._mapping)
        self._buffer = ""
        return out


def rehydrate_stream(chunks: Iterator[str], mapping: Dict[str, str]) -> Iterator[str]:
    rehydrator = StreamRehydrator(mapping)
    for chunk in chunks:
        out = rehydrator.feed(chunk)
        if out:
            yield out
    tail = rehydrator.flush()
    if tail:
        yield tail


def _content_frame(text: str) -> str:
    payload = {"choices": [{"index": 0, "delta": {"content": text}}]}
    return "data: " + json.dumps(payload) + "\n\n"


class SSERehydrator:
    """Rehydrates tokens inside an OpenAI-compatible SSE stream.

    Feed raw response text (any chunking); get back rehydrated SSE text. The
    assistant text carried across ``delta.content`` fields is funnelled through
    a single :class:`StreamRehydrator`, so tokens split across frames are still
    reassembled and replaced. Non-content lines (``event:``, blank separators,
    role-only frames, ``[DONE]``) pass through unchanged.
    """

    def __init__(self, mapping: Dict[str, str]) -> None:
        self._text = StreamRehydrator(mapping)
        self._line_buf = ""

    def feed(self, chunk: str) -> str:
        self._line_buf += chunk
        out = []
        while True:
            newline = self._line_buf.find("\n")
            if newline == -1:
                break
            line = self._line_buf[: newline + 1]
            self._line_buf = self._line_buf[newline + 1 :]
            out.append(self._process_line(line))
        return "".join(out)

    def flush(self) -> str:
        out = []
        if self._line_buf:
            out.append(self._process_line(self._line_buf))
            self._line_buf = ""
        tail = self._text.flush()
        if tail:
            out.append(_content_frame(tail))
        return "".join(out)

    def _process_line(self, line: str) -> str:
        # Preserve the original line terminator.
        body = line.rstrip("\n")
        terminator = line[len(body) :]
        stripped = body.rstrip("\r")

        if not stripped.startswith("data:"):
            return line  # event:, id:, blank separators, comments

        data = stripped[len("data:") :].lstrip()
        if data == "[DONE]":
            # Release anything the rehydrator was still holding, then finish.
            tail = self._text.flush()
            prefix = _content_frame(tail) if tail else ""
            return prefix + line

        try:
            obj = json.loads(data)
        except ValueError:
            return line

        self._rehydrate_obj(obj)
        return "data: " + json.dumps(obj) + terminator

    def _rehydrate_obj(self, obj: Dict) -> None:
        for choice in obj.get("choices", []) or []:
            delta = choice.get("delta")
            if isinstance(delta, dict) and isinstance(delta.get("content"), str):
                delta["content"] = self._text.feed(delta["content"])
            if isinstance(choice.get("text"), str):
                choice["text"] = self._text.feed(choice["text"])
