import pytest
from httpx import ASGITransport, AsyncClient
from .routers.profile import Profile, fetch_profile_by_username
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

async def mock_fetch_profile_by_username(username: str):
  return mock_profile

mock_profile = Profile()

@pytest.mark.anyio
async def test_register_success2():
    
    
    class MockColony:
        @staticmethod
        def initialize_default(id: str):
            print(f"Mock Colony initialized with ID: {id}")
            return MockColony()
        
        @staticmethod
        async def insert(*args, **kwargs):
            print("Mock Colony inserted")
            return True
    

    app.dependency_overrides[fetch_profile_by_username] = mock_fetch_profile_by_username

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test") as client: response = await client.post(
            "/profiles/register",
        )

    assert response.status_code == 200
    assert response.json()=={
        "status": "success",
        "message": "User registered successfully",
        "userId": "testId"
    }

