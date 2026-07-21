# VibeGuard 🛡️

An enterprise-ready, low-latency semantic proxy layer that sanitizes inputs and
enforces guardrails **before** data reaches an LLM — then transparently
reconstructs the personalized response on the way back.

VibeGuard sits between your client and any OpenAI-compatible provider
(OpenAI, Groq, Together, …). Every request is masked, guarded, forwarded, and
rehydrated.

```
client ──▶ VibeGuard ──▶ upstream LLM ──▶ VibeGuard ──▶ client
             │  mask PII                     │  rehydrate tokens
             │  block injections             │  (stream-safe)
             └─ store token map (TTL)        └─ from stored map
```

## Core architecture

**Inbound pipeline**
Request interception → regex + Aho-Corasick PII masking → token-map write
(Redis, TTL) → semantic injection check → upstream LLM call.

**Outbound pipeline**
Response (or stream) interception → `[REDACTED_*]` token rehydration via the
stored map → transparent client delivery.

## What's implemented (Days 1–4 + streaming foundation)

| Feature | Module | Notes |
|---|---|---|
| Reverse proxy (`/v1/chat/completions`) | [`app/main.py`](app/main.py) | `httpx` async forwarding, streaming + non-streaming |
| Deterministic PII masking | [`app/masking.py`](app/masking.py) | email, API key, SSN, credit card, phone, IPv4; masks string **and** structured/multimodal `text` parts |
| Aho-Corasick blocklist matcher | [`app/aho_corasick.py`](app/aho_corasick.py) | O(n+m) multi-pattern entity matching |
| Stateful token map (TTL) | [`app/token_store.py`](app/token_store.py) | Redis-backed, **in-memory fallback**; TTL'd audit record (see module docstring for read-back scope) |
| Semantic injection firewall | [`app/semantic.py`](app/semantic.py) | per-piece cosine similarity vs. seeded attacks; screens `user`/`tool`/`function` content, trusts the `system` prompt |
| Streaming rehydration | [`app/stream.py`](app/stream.py) | boundary-safe across chunk splits |
| Token-bucket rate limiting | [`app/rate_limit.py`](app/rate_limit.py) | opt-in per-client quota guard |

### Graceful degradation (runs anywhere)

VibeGuard has **no hard dependency on Redis or an ML stack**:

- **No Redis?** The token store falls back to an in-memory dict with the same
  TTL semantics. Set `VIBEGUARD_REDIS_URL` to switch to Redis.
- **No `sentence-transformers`?** The injection firewall falls back to a
  dependency-free bag-of-words cosine similarity that catches near-duplicate
  attack phrasings. Install `requirements-ml.txt` for real semantic embeddings
  (`all-MiniLM-L6-v2`).

This means the core logic — and the full test suite — runs on a stock
Python 3.9 with zero third-party packages.

## Quick start

### Try it with no dependencies at all

```bash
cd vibeguard
python3 demo_offline.py   # masking + guard + streaming, fully in-process
python3 run_tests.py      # 26 tests, no pytest required
```

### Run the proxy

```bash
cd vibeguard
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # set VIBEGUARD_UPSTREAM_API_KEY etc.
uvicorn app.main:app --reload --port 8000
```

Point your LLM client at `http://localhost:8000/v1/chat/completions` instead of
the provider URL. It speaks the same request/response shape.

### Docker (proxy + Redis)

```bash
cd vibeguard
VIBEGUARD_UPSTREAM_API_KEY=sk-... docker compose up --build
```

## Example

```bash
curl -s http://localhost:8000/v1/chat/completions \
  -H "authorization: Bearer $OPENAI_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Email jane.doe@acme.com about my order."}
    ]
  }'
```

The upstream LLM only ever sees `Email [REDACTED_EMAIL_1] about my order.`;
the client gets the real address back in the answer.

A prompt-injection attempt is rejected before it reaches the provider:

```json
// HTTP 403
{"error": {"message": "request blocked by VibeGuard guardrail",
           "type": "guardrail",
           "guard": {"blocked": true, "score": 0.91, "threshold": 0.85, ...}}}
```

## Configuration

All settings are environment variables — see [`.env.example`](.env.example).
Key ones:

| Variable | Default | Purpose |
|---|---|---|
| `VIBEGUARD_UPSTREAM_URL` | `https://api.openai.com` | provider base URL |
| `VIBEGUARD_UPSTREAM_API_KEY` | — | key used upstream (else caller's is forwarded) |
| `VIBEGUARD_REDIS_URL` | — | Redis URL; blank = in-memory store |
| `VIBEGUARD_TOKEN_TTL` | `600` | token-map TTL in seconds (data minimisation) |
| `VIBEGUARD_INJECTION_THRESHOLD` | `0.85` | cosine similarity block threshold |
| `VIBEGUARD_PREFER_ST_MODEL` | `1` | try `sentence-transformers`, else fallback |
| `VIBEGUARD_RATE_LIMIT` | `0` | enable token-bucket rate limiting |
| `VIBEGUARD_BLOCKLIST` | — | comma-separated named entities to mask |

## Testing

```bash
python3 run_tests.py          # zero-dependency runner (used here)
# or, if pytest is installed:
python -m pytest
```

## Roadmap (from the project plan)

- **Day 5**: full SSE streaming optimisation and buffer tuning (foundation in
  [`app/stream.py`](app/stream.py)).
- **Day 6**: integration tests against a mock upstream; container hardening.
- **Day 7**: deploy to Render + Upstash Redis.
- **Bonus**: spaCy/HuggingFace NER for contextual PII; ChromaDB-backed vector
  index; structured JSON logging + a Next.js dashboard; Slack/Discord alerts.
