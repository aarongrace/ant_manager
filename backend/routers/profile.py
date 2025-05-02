from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, Response
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


async def authenticate_user(data: ProfileBase) -> Profile:
    user = await Profile.find_one(Profile.name == data.username)
    if not user:
        logger.warning(f"Authentication failed: User with username {data.username} not found")
        raise HTTPException(status_code=400, detail="User not found")

    if not pwd_context.verify(data.password, user.password):
        logger.warning(f"Authentication failed: Incorrect password for username {data.username}")
        raise HTTPException(status_code=400, detail="Incorrect password")
        
    if user.role == "banned":
        logger.warning(f"Authentication failed: Attempted login by banned user: {data.username}")
        raise HTTPException(status_code=400, detail="User is banned")
    return user

async def fetch_profile_by_id(id: str) -> Profile:
    try:
        profile = await Profile.get(id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        logger.warning(f"Error while fetching profile: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    return profile

async def fetch_profile_by_username(username: str) -> Profile:
    try:
        profile = await Profile.find_one(Profile.name == username)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        logger.warning(f"Error while fetching profile: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    return profile

async def create_new_user(data: ProfileBase) -> Profile:
    existing = await Profile.find_one(Profile.name == data.username)
    if existing:
        logger.warning(f"User with username {data.username} already exists")
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
    return user



@profileRouter.post('/register')
async def register(user: Annotated[Profile, Depends(create_new_user)]):
    from .colony import Colony
    newColony = Colony.initialize_default(user.id)
    await newColony.insert()
    logger.info(f"Default colony initialized for user ID: {user.id}")
    return {"status": "success", "message": "User registered successfully", "userId": str(user.id)}



@profileRouter.post('/login')
async def login(user: Annotated[Profile, Depends(authenticate_user)], response: Response):
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
async def get_profile(profile: Annotated[Profile, Depends(fetch_profile_by_id)]):
    return profile

@profileRouter.put("/{id}", response_model=Profile)
async def update_profile(id: str, request: Request, profile: Annotated[Profile, Depends(fetch_profile_by_id)]):
    logger.info(f"Attempting to update profile with ID: {id}")
    data = await request.json()

    for field, value in data.items():
        if hasattr(profile, field):
            if field == "password":
                value = hash_password(value)
            setattr(profile, field, value)
    await profile.save()
    logger.info(f"Profile with ID {id} updated successfully")
    return profile


@profileRouter.delete("/delete/{username}")
async def delete_profile(user: Annotated[Profile, Depends(fetch_profile_by_username)]):
    logger.info(f"Attempting to delete profile with username: {user.name}")
    from routers.clan import Clan

    clan = await Clan.find_one(Clan.members == user.id)
    if clan:
        logger.info(f"Removing user {user.name} from clan {clan.name}")
        clan.members.remove(user.id)
        await clan.save()
    await user.delete()
    logger.info(f"Profile with username {user.name} deleted successfully")
    return {"message": f"Profile with username '{user.name}' has been deleted"}


@profileRouter.put("/update-role/{username}", response_model=Profile)
async def update_role(role_update: RoleUpdate, user: Annotated[Profile, Depends(fetch_profile_by_username)]):
    logger.info( f"Attempting to change the role of profile with username: {user.name} to {role_update}")
    user.role = role_update.role
    await user.save()
    logger.info(f"Profile with username {user.name} is now {role_update}")
    return user


@profileRouter.get("/get-data/{username}", response_model=Profile)
async def get_profile(user: Annotated[Profile, Depends(fetch_profile_by_username)]):
    logger.info(f"Fetching profile data for username: {user.name}")
    return user


@profileRouter.get("/get-id/{username}")
async def get_id(user: Annotated[Profile, Depends(fetch_profile_by_username)]):
    logger.info(f"Fetching ID for username: {user.name}")
    return {"id": str(user.id)}

    
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
