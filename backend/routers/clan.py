from fastapi import APIRouter, HTTPException, Request, Depends
from beanie import Document
from pydantic import BaseModel
from datetime import datetime
from routers.profile import Profile
import uuid
import logging

logger = logging.getLogger(__name__)

clanRouter = APIRouter()

class ClanBase(BaseModel):
    name: str
    max_size: int = 50
    description: str = ""

class Clan(Document):
    id: str  # Unique ID
    name: str
    leader: str  # User ID of the clan leader
    members: list[str]  # List of User IDs
    max_size: int  # Maximum allowed members
    created_date: datetime
    description: str = ""

    class Settings:
        name = "clans" 

    @classmethod
    def initialize_default(cls, leader_id: str, name: str = "Test Clan") -> "Clan":
        return cls(
            id=str(uuid.uuid4()),
            name=name,
            leader=leader_id,
            members=[leader_id],
            max_size=50,
            created_date=datetime.now(),
            description="Default Clan",
        )

def require_user(request: Request):
    if not hasattr(request.state, "user"):
        logger.warning("Unauthorized access attempt")
        raise HTTPException(status_code=401, detail="Unauthorized")
    return request.state.user

@clanRouter.post("/create")
async def create_clan(data: ClanBase, request: Request):
    user = require_user(request)
    logger.info(f"User {user['id']} is attempting to create a clan with name: {data.name}")

    existing = await Clan.find_one(Clan.name == data.name)
    if existing:
        logger.warning(f"Clan creation failed: Clan with name {data.name} already exists")
        raise HTTPException(status_code=400, detail="Clan already exists")

    clan = Clan(
        id=str(uuid.uuid4()),
        name=data.name,
        leader=user["id"],
        members=[user["id"]],
        max_size=data.max_size,
        created_date=datetime.now(),
        description=data.description,
    )

    await clan.insert()
    logger.info(f"Clan {clan.name} created successfully with ID: {clan.id}")

    profile = await Profile.get(user["id"])
    if not profile:
        logger.error(f"User profile not found for user ID: {user['id']}")
        raise HTTPException(status_code=404, detail="User profile not found")

    profile.clan = clan.id
    await profile.save()
    logger.info(f"User {user['id']} added to clan {clan.name}")

    return {"status": "success", "clan_id": clan.id}

'''
Join an existing clan
'''
@clanRouter.post("/{clan_id}/join")
async def join_clan(clan_id: str, request: Request):
    user = require_user(request)
    logger.info(f"User {user['id']} is attempting to join clan with ID: {clan_id}")

    clan = await Clan.get(clan_id)
    if not clan:
        logger.warning(f"Join failed: Clan with ID {clan_id} not found")
        raise HTTPException(status_code=404, detail="Clan not found")
    if user["id"] in clan.members:
        logger.warning(f"User {user['id']} is already a member of clan {clan.name}")
        raise HTTPException(status_code=400, detail="Already in clan")
    if len(clan.members) >= clan.max_size:
        logger.warning(f"Clan {clan.name} is full. User {user['id']} cannot join")
        raise HTTPException(status_code=400, detail="Clan is full")

    clan.members.append(user["id"])
    await clan.save()
    logger.info(f"User {user['id']} successfully joined clan {clan.name}")

    # Now update the user's clan field:
    profile = await Profile.get(user["id"])
    if profile:
        profile.clan = clan.id
        await profile.save()
        logger.info(f"User {user['id']}'s profile updated with clan ID: {clan.id}")

    return {"status": "success", "message": f"Joined {clan.name}"}

'''
List all clans
'''
@clanRouter.get("/all")
async def list_all_clans():
    logger.info("Fetching all clans")
    clans = await Clan.find_all().to_list()
    logger.info(f"Fetched {len(clans)} clans")
    return clans


'''
Get a clan by ID
'''
@clanRouter.get("/{clan_id}")
async def get_clan(clan_id: str):
    logger.info(f"Fetching clan with ID: {clan_id}")
    clan = await Clan.get(clan_id)
    if not clan:
        logger.warning(f"Clan with ID {clan_id} not found")
        raise HTTPException(status_code=404, detail="Clan not found")
    return clan

'''
Leave a clan
'''
@clanRouter.post("/{clan_id}/leave")
async def leave_clan(clan_id: str, request: Request):
    user = request.state.user
    if not user:
        logger.warning("Unauthorized access attempt to leave a clan")
        raise HTTPException(status_code=401, detail="Unauthorized")

    clan = await Clan.get(clan_id)
    if not clan:
        logger.warning(f"Leave failed: Clan with ID {clan_id} not found")
        raise HTTPException(status_code=404, detail="Clan not found")

    if user["id"] not in clan.members:
        logger.warning(f"User {user['id']} is not a member of clan {clan.name}")
        raise HTTPException(status_code=400, detail="You are not a member of this clan")

    clan.members.remove(user["id"])
    logger.info(f"User {user['id']} removed from clan {clan.name}")

    from routers.profile import Profile
    profile = await Profile.get(user["id"])
    if profile:
        profile.clan = "" 
        await profile.save()
        logger.info(f"User {user['id']}'s profile updated to remove clan association")

    if clan.leader == user["id"]:
        if clan.members:
            clan.leader = clan.members[0]
            logger.info(f"New leader for clan {clan.name} is {clan.leader}")
        else:
            await clan.delete()
            logger.info(f"Clan {clan.name} deleted as no members remained")
            return {"status": "success", "message": "Clan deleted because leader left and no members remained"}

    await clan.save()
    return {"status": "success", "message": f"Left {clan.name}"}

'''
kick
'''
@clanRouter.post("/{clan_id}/kick/{member_id}")
async def kick_member(clan_id: str, member_id: str, request: Request):
    user = request.state.user
    if not user:
        logger.warning("Unauthorized access attempt to kick a member")
        raise HTTPException(status_code=401, detail="Unauthorized")

    clan = await Clan.get(clan_id)
    if not clan:
        logger.warning(f"Kick failed: Clan with ID {clan_id} not found")
        raise HTTPException(status_code=404, detail="Clan not found")

    if clan.leader != user["id"]:
        logger.warning(f"User {user['id']} is not the leader of clan {clan.name}")
        raise HTTPException(status_code=403, detail="Only the leader can kick members")

    if member_id not in clan.members:
        logger.warning(f"User {member_id} is not a member of clan {clan.name}")
        raise HTTPException(status_code=400, detail="User not in this clan")

    clan.members.remove(member_id)
    await clan.save()
    logger.info(f"User {member_id} removed from clan {clan.name}")

    member_profile = await Profile.get(member_id)
    if member_profile:
        member_profile.clan = ""
        await member_profile.save()
        logger.info(f"User {member_id}'s profile updated to remove clan association")

    return {"status": "success", "message": "Member kicked successfully"}
