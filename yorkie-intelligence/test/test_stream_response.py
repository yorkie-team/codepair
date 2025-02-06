import pytest
from httpx import AsyncClient, ASGITransport

from src.main import app


# TODO
# test시 smollm2:135m 모델 사용하도록 변경


@pytest.mark.asyncio
async def test_stream_pr():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://127.0.0.1:8000"
    ) as client:
        async with client.stream(
            "POST", "/intelligence/pr/create", json={"query": "hi"}
        ) as response:
            assert response.status_code == 200  # 응답 상태 확인

            # data = []
            # async for line in response.aiter_lines():
            #     data.append(line)


@pytest.mark.asyncio
async def test_stream_issue():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://127.0.0.1:8000"
    ) as client:
        async with client.stream(
            "POST", "/intelligence/pr/create", json={"query": "hi"}
        ) as response:
            assert response.status_code == 200  # 응답 상태 확인


#             data = []
#             async for line in response.aiter_lines():
#                 data.append(line)
