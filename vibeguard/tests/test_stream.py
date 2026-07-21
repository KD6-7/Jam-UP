import json

from app.stream import SSERehydrator, StreamRehydrator, rehydrate_stream


def _split(text, size):
    return [text[i : i + size] for i in range(0, len(text), size)]


def test_rehydrates_token_split_across_chunks():
    mapping = {"[REDACTED_EMAIL_1]": "jane@example.com"}
    source = "Hi [REDACTED_EMAIL_1], welcome back."
    expected = "Hi jane@example.com, welcome back."
    for size in (1, 2, 3, 5, 7, 100):
        out = "".join(rehydrate_stream(_split(source, size), mapping))
        assert out == expected, "failed at chunk size %d" % size


def test_multiple_tokens_various_lengths():
    mapping = {
        "[REDACTED_EMAIL_1]": "a@b.com",
        "[REDACTED_ENTITY_1]": "Project Nimbus",
    }
    source = "Ping [REDACTED_EMAIL_1] about [REDACTED_ENTITY_1] today."
    expected = "Ping a@b.com about Project Nimbus today."
    for size in (1, 4, 9, 200):
        out = "".join(rehydrate_stream(_split(source, size), mapping))
        assert out == expected


def test_no_mapping_passthrough():
    out = "".join(rehydrate_stream(_split("plain text stream", 3), {}))
    assert out == "plain text stream"


def test_manual_feed_flush():
    r = StreamRehydrator({"[REDACTED_EMAIL_1]": "x@y.com"})
    collected = r.feed("start [REDAC") + r.feed("TED_EMAIL_1] end")
    collected += r.flush()
    assert collected == "start x@y.com end"


def _sse_frames(text, piece_size):
    """Serialize `text` as OpenAI-style SSE with content split every N chars,
    so a token straddles multiple `data:` frames."""
    frames = []
    for i in range(0, len(text), piece_size):
        piece = text[i : i + piece_size]
        frames.append("data: " + json.dumps({"choices": [{"index": 0, "delta": {"content": piece}}]}) + "\n\n")
    frames.append("data: [DONE]\n\n")
    return "".join(frames)


def _collect_content(sse_text):
    content = ""
    for line in sse_text.splitlines():
        if line.startswith("data:"):
            data = line[len("data:"):].strip()
            if data and data != "[DONE]":
                obj = json.loads(data)
                for choice in obj.get("choices", []):
                    content += choice.get("delta", {}).get("content", "")
    return content


def test_sse_rehydrates_token_split_across_frames():
    mapping = {"[REDACTED_EMAIL_1]": "bob@corp.io"}
    source_text = "Reply to [REDACTED_EMAIL_1] please."
    expected = "Reply to bob@corp.io please."
    for piece_size in (1, 3, 5, 50):
        sse = _sse_frames(source_text, piece_size)
        r = SSERehydrator(mapping)
        # Feed the whole SSE payload in awkward transport-sized chunks.
        out = ""
        for i in range(0, len(sse), 7):
            out += r.feed(sse[i : i + 7])
        out += r.flush()
        assert _collect_content(out) == expected, "piece_size=%d" % piece_size
        assert "data: [DONE]" in out


def test_sse_passes_through_done_and_non_content():
    r = SSERehydrator({"[REDACTED_EMAIL_1]": "a@b.com"})
    out = r.feed('data: {"choices":[{"index":0,"delta":{"role":"assistant"}}]}\n\n')
    out += r.feed("data: [DONE]\n\n")
    out += r.flush()
    assert "assistant" in out
    assert "data: [DONE]" in out
