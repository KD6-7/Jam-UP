"""FastAPI application: the VibeGuard proxy surface.

Routes:
* ``GET  /health``                 - liveness + which backends are active.
* ``POST /v1/chat/completions``    - OpenAI-compatible masked proxy
                                     (streaming and non-streaming).
"""

from __future__ import annotations

import json
from typing import Any, AsyncIterator, Dict

import httpx
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse

from . import __version__
from .config import Settings, get_settings
from .masking import Masker
from .proxy import (
    InjectionBlocked,
    prepare_request,
    rehydrate_response_body,
)
from .rate_limit import TokenBucket
from .schemas import GuardInfo, HealthResponse
from .semantic import InjectionGuard, get_embedder
from .injection_seeds import INJECTION_SEEDS
from .stream import SSERehydrator
from .token_store import get_token_store

app = FastAPI(title="VibeGuard", version=__version__)


class AppState:
    settings: Settings
    masker: Masker
    guard: "InjectionGuard | None"
    token_store: Any
    http: httpx.AsyncClient
    rate_limiter: "TokenBucket | None"


state = AppState()


@app.on_event("startup")
async def _startup() -> None:
    settings = get_settings()
    state.settings = settings
    state.masker = Masker(blocklist=settings.blocklist)
    state.token_store = get_token_store(settings.redis_url, settings.token_ttl_seconds)
    state.http = httpx.AsyncClient(
        base_url=settings.upstream_base_url, timeout=settings.upstream_timeout
    )
    if settings.enable_semantic_guard:
        embedder = get_embedder(settings.embedding_model, settings.prefer_semantic_model)
        state.guard = InjectionGuard(embedder, INJECTION_SEEDS, settings.injection_threshold)
    else:
        state.guard = None
    state.rate_limiter = (
        TokenBucket(settings.rate_limit_capacity, settings.rate_limit_refill_per_sec)
        if settings.rate_limit_enabled
        else None
    )


@app.on_event("shutdown")
async def _shutdown() -> None:
    await state.http.aclose()
    await state.token_store.close()


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    store_kind = type(state.token_store).__name__
    return HealthResponse(
        version=__version__,
        token_store=store_kind,
        semantic_backend=state.guard.backend if state.guard else "disabled",
        semantic_enabled=state.guard is not None,
    )


def _client_key(request: Request) -> str:
    auth = request.headers.get("authorization", "")
    if auth:
        return auth
    return request.client.host if request.client else "anonymous"


def _forward_headers(request: Request) -> Dict[str, str]:
    headers = {}
    # Prefer a configured upstream key; otherwise pass the caller's auth through.
    if state.settings.upstream_api_key:
        headers["authorization"] = "Bearer " + state.settings.upstream_api_key
    elif "authorization" in request.headers:
        headers["authorization"] = request.headers["authorization"]
    headers["content-type"] = "application/json"
    return headers


@app.post("/v1/chat/completions")
async def chat_completions(request: Request) -> Response:
    if state.rate_limiter is not None and not state.rate_limiter.allow(_client_key(request)):
        return JSONResponse(
            status_code=429,
            content={"error": {"message": "rate limit exceeded", "type": "rate_limit"}},
        )

    try:
        payload: Dict[str, Any] = await request.json()
    except json.JSONDecodeError:
        return JSONResponse(status_code=400, content={"error": {"message": "invalid JSON"}})

    # Inbound: mask + injection guard.
    try:
        prepared = prepare_request(payload, state.masker, state.guard)
    except InjectionBlocked as blocked:
        info = GuardInfo(
            blocked=True,
            reason="prompt_injection_detected",
            score=round(blocked.score, 4),
            matched_seed=blocked.seed,
            threshold=blocked.threshold,
            backend=blocked.backend,
        )
        return JSONResponse(
            status_code=403,
            content={"error": {"message": "request blocked by VibeGuard guardrail",
                               "type": "guardrail", "guard": info.model_dump()}},
        )

    await state.token_store.save(prepared.session_id, prepared.mapping)
    stream = bool(payload.get("stream"))
    headers = _forward_headers(request)

    if stream:
        return StreamingResponse(
            _proxy_stream(prepared.payload, prepared.mapping, headers),
            media_type="text/event-stream",
        )
    return await _proxy_once(prepared.payload, prepared.mapping, headers)


async def _proxy_once(
    payload: Dict[str, Any], mapping: Dict[str, str], headers: Dict[str, str]
) -> Response:
    upstream = await state.http.post("/v1/chat/completions", json=payload, headers=headers)
    if upstream.headers.get("content-type", "").startswith("application/json"):
        body = upstream.json()
        body = rehydrate_response_body(body, mapping)
        return JSONResponse(status_code=upstream.status_code, content=body)
    # Non-JSON upstream (error page etc.) — pass through rehydrated text.
    from .masking import rehydrate_text

    return Response(
        content=rehydrate_text(upstream.text, mapping),
        status_code=upstream.status_code,
        media_type=upstream.headers.get("content-type", "text/plain"),
    )


async def _proxy_stream(
    payload: Dict[str, Any], mapping: Dict[str, str], headers: Dict[str, str]
) -> AsyncIterator[bytes]:
    rehydrator = SSERehydrator(mapping)
    async with state.http.stream(
        "POST", "/v1/chat/completions", json=payload, headers=headers
    ) as upstream:
        async for chunk in upstream.aiter_text():
            out = rehydrator.feed(chunk)
            if out:
                yield out.encode("utf-8")
    tail = rehydrator.flush()
    if tail:
        yield tail.encode("utf-8")
