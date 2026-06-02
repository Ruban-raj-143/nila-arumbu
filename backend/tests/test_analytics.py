"""
Nila Arumbu — Analytics Unit Tests
Tests the analytics service logic.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_analytics_summary_requires_auth(client: AsyncClient):
    """Analytics endpoints must reject unauthenticated requests."""
    response = await client.get("/api/v1/analytics/summary")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_analytics_centres_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/analytics/centres/risk")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_analytics_referral_aging_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/analytics/referrals/aging")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_voice_transcribe_requires_auth(client: AsyncClient):
    """Voice endpoint must reject unauthenticated requests."""
    response = await client.post("/api/v1/voice/transcribe")
    assert response.status_code in (401, 422)  # 422 if no file, 401 if no auth
