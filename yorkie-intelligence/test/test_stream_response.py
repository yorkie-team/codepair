import pytest
from httpx import AsyncClient, ASGITransport

from src.main import app


# @TODO(@sihyeong671): Change to use the smollm2:135m model when testing these api.(or fakellm)


@pytest.mark.asyncio
async def test_stream_pr():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://127.0.0.1:8000"
    ) as client:
        async with client.stream(
            "POST", "/intelligence/pr/create", json={"query": "hi"}
        ) as response:
            assert response.status_code == 200


@pytest.mark.asyncio
async def test_stream_issue():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://127.0.0.1:8000"
    ) as client:
        async with client.stream(
            "POST", "/intelligence/issue/create", json={"query": "hi"}
        ) as response:
            assert response.status_code == 200


@pytest.mark.asyncio
async def test_stream_write_doc():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://127.0.0.1:8000"
    ) as client:
        async with client.stream(
            "POST", "/intelligence/doc/create", json={"query": "hi"}
        ) as response:
            assert response.status_code == 200
