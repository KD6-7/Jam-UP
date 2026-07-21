import asyncio

from app.token_store import InMemoryTokenStore, get_token_store


def test_save_and_load_roundtrip():
    async def run():
        store = InMemoryTokenStore()
        await store.save("sess1", {"[REDACTED_EMAIL_1]": "a@b.com"})
        loaded = await store.load("sess1")
        assert loaded == {"[REDACTED_EMAIL_1]": "a@b.com"}

    asyncio.run(run())


def test_ttl_expiry():
    async def run():
        store = InMemoryTokenStore()
        await store.save("s", {"[REDACTED_X_1]": "v"}, ttl=0)
        # ttl=0 -> expires immediately.
        assert await store.load("s") == {}

    asyncio.run(run())


def test_missing_session_returns_empty():
    async def run():
        store = InMemoryTokenStore()
        assert await store.load("nope") == {}

    asyncio.run(run())


def test_factory_falls_back_to_memory_without_redis():
    store = get_token_store(None)
    assert isinstance(store, InMemoryTokenStore)
    # A bogus URL with redis missing should still not raise.
    store2 = get_token_store("redis://localhost:6379/0")
    assert store2 is not None
