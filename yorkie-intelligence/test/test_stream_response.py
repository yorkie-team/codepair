import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from langchain_core.language_models.fake import FakeStreamingListLLM

from src.main import app
from src.common.llms import get_model


@pytest_asyncio.fixture()
async def client():
    fake_responses = ["hello, I'm a Yorkie Intelligence ChatBot, How Can I help you?"]
    fake_llm = FakeStreamingListLLM(responses=fake_responses)
    app.dependency_overrides[get_model] = lambda: fake_llm
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://127.0.0.1:8000"
    ) as client:
        yield client


@pytest.mark.asyncio()
async def test_stream_pr(client):
    async with client.stream(
        "POST", "/intelligence/pr/", json={"query": "hi"}
    ) as response:
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_stream_issue(client):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://127.0.0.1:8000"
    ) as client:
        async with client.stream(
            "POST", "/intelligence/issue/", json={"query": "hi"}
        ) as response:
            assert response.status_code == 200


@pytest.mark.asyncio
async def test_stream_write_doc(client):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://127.0.0.1:8000"
    ) as client:
        async with client.stream(
            "POST", "/intelligence/doc/", json={"query": "hi"}
        ) as response:
            assert response.status_code == 200


# TODO
# store test
