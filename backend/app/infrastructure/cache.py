"""
Nila Arumbu — Redis Cache Client
Provides async get/set/delete with JSON serialisation.
"""
import json
import logging
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> None:
    try:
        client = await get_redis()
        await client.setex(key, ttl_seconds, json.dumps(value, default=str))
    except Exception as exc:
        logger.warning("Cache set failed for key=%s: %s", key, exc)


async def cache_get(key: str) -> Any | None:
    try:
        client = await get_redis()
        raw = await client.get(key)
        return json.loads(raw) if raw else None
    except Exception as exc:
        logger.warning("Cache get failed for key=%s: %s", key, exc)
        return None


async def cache_delete(key: str) -> None:
    try:
        client = await get_redis()
        await client.delete(key)
    except Exception as exc:
        logger.warning("Cache delete failed for key=%s: %s", key, exc)
