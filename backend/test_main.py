import pytest
from httpx import AsyncClient, ASGITransport

from main import app


# sign up 
# log in
# create colony
# get colony
@pytest.mark.anyio
async def test_root():
    async with AsyncClient(
        transport=ASGITransport(app=app),base_url="http://test"
    ) as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"msg": "Greetings, ant boss."}