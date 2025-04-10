from fastapi import APIRouter, HTTPException, Request
from beanie import Document
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
    clan: str  # Clan the user belongs to
    email: str  # Email address
    picture: str  # Profile picture URL
    lastLoggedIn: datetime  # Last login timestamp

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
            clan="Clanity Clan",
            email="john@test.com",
            picture="",
            lastLoggedIn=datetime.now(),
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
async def update_profile(id: str, request: Request):
    existing_profile = await Profile.get(id)
    if not existing_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    data = await request.json()

    for field, value in data.items():
        if hasattr(existing_profile, field):
            setattr(existing_profile, field, value)
    await existing_profile.save()
    return existing_profile

@profileRouter.delete("/{id}", response_model=dict)
async def delete_profile(id: str):
    profile = await Profile.get(id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    await profile.delete()
    return {"message": f"Profile with ID '{id}' has been deleted"}


async def ensure_guest_profile_exists(reinitialize: bool = False):
    guest_profile = await Profile.get("guest")

    if guest_profile and reinitialize:
        await guest_profile.delete()
        print("Reinitializing guest profile...")
        print("Guest profile deleted.")
    
    if not guest_profile or reinitialize:
        guest_profile = Profile.initialize_default("guest")
        await guest_profile.insert()
        print("Guest profile created.")
    else:
        print("Guest profile already exists.")