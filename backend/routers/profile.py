from fastapi import APIRouter, HTTPException, Request, Response
from beanie import Document
from datetime import datetime
from enum import Enum
import uuid
from passlib.context import CryptContext
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class RoleEnum(str, Enum):
    admin = "admin"
    user = "user"
    banned = "banned"

class RoleUpdate(BaseModel):
    role: RoleEnum

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
    logger.info(f"Attempting to register user with username: {data.username}")
    existing = await Profile.find_one(Profile.name == data.username)
    if existing:
        logger.warning(f"Registration failed: User with username {data.username} already exists")
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
    logger.info(f"User {user.name} registered successfully with ID: {user.id}")

    from .colony import Colony
    newColony = Colony.initialize_default(user.id)
    await newColony.insert()
    logger.info(f"Default colony initialized for user ID: {user.id}")

    return {"status": "success", "message": "User registered successfully", "userId": str(user.id)}

@profileRouter.post('/login')
async def login(data: ProfileBase, response: Response):
    logger.info(f"Attempting login for username: {data.username}")
    user = await Profile.find_one(Profile.name == data.username)
    if not user:
        logger.warning(f"Login failed: User with username {data.username} not found")
        raise HTTPException(status_code=400, detail="User not found")

    if not pwd_context.verify(data.password, user.password):
        logger.warning(f"Login failed: Incorrect password for username {data.username}")
        raise HTTPException(status_code=400, detail="Incorrect password")

    user.lastLoggedIn = datetime.now()
    await user.save()
    logger.info(f"User {user.name} logged in successfully")

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
    logger.info("Logging out user")
    response.delete_cookie(key="userId")
    logger.info("User logged out successfully")
    return {"status": "success", "message": "Logged out successfully"}

@profileRouter.get("/{id}", response_model=Profile)
async def get_profile(id: str):
    logger.info(f"Fetching profile with ID: {id}")
    profile = await Profile.get(id)
    if not profile:
        logger.warning(f"Profile with ID {id} not found")
        raise HTTPException(status_code=404, detail="Profile not found")
    logger.info(f"Profile with ID {id} fetched successfully")
    return profile

@profileRouter.post("/{id}", response_model=Profile)
async def create_profile(profile: Profile):
    logger.info(f"Attempting to create profile with ID: {profile.id}")
    existing_profile = await Profile.get(profile.id)
    if existing_profile:
        logger.warning(f"Profile creation failed: Profile with ID {profile.id} already exists")
        raise HTTPException(status_code=400, detail="Profile already exists")
    await profile.insert()
    logger.info(f"Profile with ID {profile.id} created successfully")
    return profile

@profileRouter.put("/{id}", response_model=Profile)
async def update_profile(id: str, request: Request):
    logger.info(f"Attempting to update profile with ID: {id}")
    existing_profile = await Profile.get(id)
    if not existing_profile:
        logger.warning(f"Profile update failed: Profile with ID {id} not found")
        raise HTTPException(status_code=404, detail="Profile not found")
    data = await request.json()

    for field, value in data.items():
        if hasattr(existing_profile, field):
            setattr(existing_profile, field, value)
    await existing_profile.save()
    logger.info(f"Profile with ID {id} updated successfully")
    return existing_profile

@profileRouter.delete("/{id}", response_model=dict)
async def delete_profile(id: str):
    logger.info(f"Attempting to delete profile with ID: {id}")
    profile = await Profile.get(id)
    if not profile:
        logger.warning(f"Profile deletion failed: Profile with ID {id} not found")
        raise HTTPException(status_code=404, detail="Profile not found")
    await profile.delete()
    logger.info(f"Profile with ID {id} deleted successfully")
    return {"message": f"Profile with ID '{id}' has been deleted"}

@profileRouter.put("/update-role/{username}", response_model=Profile)
async def update_role(username: str, role_update: RoleUpdate):
    user = await Profile.find_one(Profile.name == username)
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    user.role = role_update.role
    await user.save()
    return user
    
async def ensure_guest_profile_exists(reinitialize: bool = False):
    logger.info("Ensuring guest profile exists")
    guest_profile = await Profile.get("guest")

    if guest_profile and reinitialize:
        logger.info("Reinitializing guest profile")
        await guest_profile.delete()
    
    if not guest_profile or reinitialize:
        guest_profile = Profile.initialize_default("guest")
        await guest_profile.insert()
        logger.info("Guest profile initialized successfully")
