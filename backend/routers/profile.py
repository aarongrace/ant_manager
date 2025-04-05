from fastapi import APIRouter, HTTPException
from beanie import Document
from typing import Optional
from datetime import datetime
from enum import Enum


class RoleEnum(str, Enum):
    admin = "admin"
    user = "user"


class Profile(Document):
    id: str  # Unique identifier for the profile
    name: str  # User's name
    role: RoleEnum  # User's role (admin or user)
    createdDate: datetime  # Date the profile was created
    password: str  # User's password
    clan: Optional[str] = None  # Optional clan the user belongs to
    email: Optional[str] = ""  # Optional email address
    picture: Optional[str] = None  # Optional profile picture URL
    lastLoggedIn: Optional[datetime] = None  # Optional last login timestamp

    class Settings:
        name = "profiles"  # MongoDB collection name

    @classmethod
    def initialize_default(cls, id: str) -> "Profile":
        return cls(
            id=id,
            name="John Tester",
            role=RoleEnum.user,
            createdDate=datetime.now(),
            password="default_password",  # Placeholder password
            clan=None,
            email=None,
            picture=None,
            lastLoggedIn=None,
        )

profileRouter = APIRouter()

@profileRouter.get("/{id}", response_model=Profile)
async def get_profile(id: str):
    profile = await Profile.get(id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@profileRouter.post("/{id}", response_model=Profile)
async def create_profile(profile: Profile):
    existing_profile = await Profile.get(profile.id)
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")
    await profile.insert_one()
    return profile

@profileRouter.put("/{id}", response_model=Profile)
async def update_profile(id: str, updated_profile: Profile):
    existing_profile = await Profile.get(id)
    if not existing_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    updated_profile.id = id
    await updated_profile.save()
    return updated_profile

@profileRouter.delete("/{id}", response_model=dict)
async def delete_profile(id: str):
    profile = await Profile.get(id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    await profile.delete()
    return {"message": f"Profile with ID '{id}' has been deleted"}