from fastapi import APIRouter, HTTPException, Request, Response
from beanie import Document
from datetime import datetime
from enum import Enum
import uuid
from passlib.context import CryptContext
from pydantic import BaseModel

class RoleEnum(str, Enum):
    admin = "admin"
    user = "user"

class ProfileBase(BaseModel):
    username: str  
    password: str

class Profile(Document):
    id: str
    name: str
    role: RoleEnum
    createdDate: datetime
    password: str
    clan: str
    email: str
    picture: str
    lastLoggedIn: datetime

    class Settings:
        name = "profiles"

    @classmethod
    def initialize_default(cls, id: str) -> "Profile":
        return cls(
            id=id,
            name="John Tester",
            role=RoleEnum.user,
            createdDate=datetime.now(),
            password="default_password",
            clan="Clanity Clan",
            email="john@test.com",
            picture="",
            lastLoggedIn=datetime.now(),
        )

profileRouter = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

@profileRouter.post('/register')
async def register(data: ProfileBase):
    existing = await Profile.find_one(Profile.name == data.username)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user = Profile(
        id=str(uuid.uuid4()),
        name=data.username,
        role=RoleEnum.user,
        createdDate=datetime.now(),
        password=hash_password(data.password),
        clan="",
        email="",
        picture="",
        lastLoggedIn=datetime.now()
    )

    await user.insert()

    from .colony import Colony
    newColony = Colony.initialize_default(user.id)
    await newColony.insert()

    return {"status": "success", "message": "User registered successfully", "userId": str(user.id)}

@profileRouter.post('/login')
async def login(data: ProfileBase, response: Response):
    user = await Profile.find_one(Profile.name == data.username)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if not pwd_context.verify(data.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    user.lastLoggedIn = datetime.now()
    await user.save()

    response.set_cookie(
        key="userId",
        value=str(user.id),
        httponly=True,
        samesite="lax",
        secure=False 
    )

    return {
        "status": "success",
        "message": "Login successful",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "role": user.role,
            "clan": user.clan,
            "email": user.email,
            "picture": user.picture
        },
        "userId": str(user.id),
    }

@profileRouter.post('/logout')
async def logout(response: Response):
    response.delete_cookie(key="userId")
    return {"status": "success", "message": "Logged out successfully"}

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
    await profile.insert()
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
    
    if not guest_profile or reinitialize:
        guest_profile = Profile.initialize_default("guest")
        await guest_profile.insert()
