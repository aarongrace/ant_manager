import copy
import pytest
from httpx import ASGITransport, AsyncClient
from routers.profile import Profile, fetch_profile_by_username
from main import app
from fastapi import HTTPException
from datetime import datetime
from enum import Enum


@pytest.mark.anyio
async def test_register_success(monkeypatch):
    
    print("Starting test_register_success")
    class MockProfile:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)
            self.id = "testId"
            print(f"Mock Profile initialized with ID: {self.id}")

        @staticmethod
        async def find_one(*args, **kwargs):
            print("Mock Profile find_one called")
            return None
        
        async def insert(*args, **kwargs):
            print("Mock Profile inserted")
            return True
        
        userId = "testuser"
        name = None
    
    class MockColony:
        @staticmethod
        def initialize_default(id: str):
            print(f"Mock Colony initialized with ID: {id}")
            return MockColony()
        
        @staticmethod
        async def insert(*args, **kwargs):
            print("Mock Colony inserted")
            return True
    
    monkeypatch.setattr("routers.profile.Profile", MockProfile)
    monkeypatch.setattr("routers.colony.Colony", MockColony)

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test") as client: 
        response = await client.post(
            "/profiles/register",
            json={
                "username": "testuser",
                "password": "testpassword"
            }
        )

    assert response.status_code == 200
    assert response.json()=={
        "status": "success",
        "message": "User registered successfully",
        "userId": "testId"
    }


@pytest.mark.anyio
async def test_update_role_to_admin():
    class MockProfile:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)

        @staticmethod
        async def find_one(*args, **kwargs):
            return None

        async def insert(self):
            return True
        
        async def save(self):
            return True

    mock_profile = MockProfile(
        id="testId",
        name="John Tester",
        role="user",
        createdDate=datetime(2023, 1, 1, 12, 0, 0),
        password="hashed_testpassword",
        clan="Clan Unity",
        email="john@test.com",
        picture="default.png",
        lastLoggedIn=datetime(2023, 1, 1, 12, 0, 0),
    )

    app.dependency_overrides[fetch_profile_by_username] = lambda : mock_profile

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.put(
            "/profiles/update-role/testuser",
            json={
                "role": "admin"
            }
        )

    data = response.json()
    assert response.status_code == 200
    assert data["_id"] == "testId"
    assert data["name"] == "John Tester"
    assert data["role"] == "admin"
        
