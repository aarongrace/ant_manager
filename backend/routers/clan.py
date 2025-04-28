from fastapi import APIRouter, HTTPException, Request, Depends
from beanie import Document
from pydantic import BaseModel
from datetime import datetime
from routers.profile import Profile
import uuid

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
        raise HTTPException(status_code=401, detail="Unauthorized")
    return request.state.user

@clanRouter.post("/create")
async def create_clan(data: ClanBase, request: Request):
    user = require_user(request)

    existing = await Clan.find_one(Clan.name == data.name)
    if existing:
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

    profile = await Profile.get(user["id"])
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")

    profile.clan = clan.id
    await profile.save()

    return {"status": "success", "clan_id": clan.id}

'''
Join an existing clan
'''
@clanRouter.post("/{clan_id}/join")
async def join_clan(clan_id: str, request: Request):
    user = require_user(request)
    clan = await Clan.get(clan_id)
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")
    if user["id"] in clan.members:
        raise HTTPException(status_code=400, detail="Already in clan")
    if len(clan.members) >= clan.max_size:
        raise HTTPException(status_code=400, detail="Clan is full")

    clan.members.append(user["id"])
    await clan.save()

    # Now update the user's clan field:
    profile = await Profile.get(user["id"])
    if profile:
        profile.clan = clan.id
        await profile.save()

    return {"status": "success", "message": f"Joined {clan.name}"}

'''
List all clans
'''
@clanRouter.get("/all")
async def list_all_clans():
    clans = await Clan.find_all().to_list()
    return clans


'''
Get a clan by ID
'''
@clanRouter.get("/{clan_id}")
async def get_clan(clan_id: str):
    clan = await Clan.get(clan_id)
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")
    return clan

'''
Leave a clan
'''
@clanRouter.post("/{clan_id}/leave")
async def leave_clan(clan_id: str, request: Request):
    user = request.state.user
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    clan = await Clan.get(clan_id)
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")

    if user["id"] not in clan.members:
        raise HTTPException(status_code=400, detail="You are not a member of this clan")

    clan.members.remove(user["id"])

    from routers.profile import Profile
    profile = await Profile.get(user["id"])
    if profile:
        profile.clan = "" 
        await profile.save()

    if clan.leader == user["id"]:
        if clan.members:
            clan.leader = clan.members[0]
        else:
            await clan.delete()
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
        raise HTTPException(status_code=401, detail="Unauthorized")

    clan = await Clan.get(clan_id)
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")

    if clan.leader != user["id"]:
        raise HTTPException(status_code=403, detail="Only the leader can kick members")

    if member_id not in clan.members:
        raise HTTPException(status_code=400, detail="User not in this clan")

    clan.members.remove(member_id)
    await clan.save()

    member_profile = await Profile.get(member_id)
    if member_profile:
        member_profile.clan = ""
        await member_profile.save()

    return {"status": "success", "message": "Member kicked successfully"}
