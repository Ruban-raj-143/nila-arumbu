"""
Nila Arumbu — Health Endpoint Tests
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_returns_ok(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Nila Arumbu" in data["service"]


@pytest.mark.asyncio
async def test_root_returns_message(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    assert "Nila Arumbu" in response.json()["message"]
