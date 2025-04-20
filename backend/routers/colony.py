from fastapi import APIRouter, HTTPException, Request
from typing import List
from beanie import Document
from pydantic import ValidationError

from game_logic.enemy import Enemy
from game_logic.fruit import Fruit
from game_logic.ant import Ant
from game_logic.map_entity import MapEntity


# todo implement batch logic. Right now the updates are not just too frequent, but handling actions in a different router means that if it coincides with the put request, the action gets overwritten
# either we add a buffer in memory or we handle all the actions on the frontend and fetch less often



class Colony(Document):
    id: str  # The colony ID should always be the same as the user ID
    name: str  # Name of the colony
    ants: List[Ant]  # Number of ants in the colony
    mapEntities: List[MapEntity]
    enemies: List[Enemy]
    fruits: List[Fruit]
    eggs: int = 5  # Number of eggs in the colony, defaulted to 5
    food: float  # Amount of food available
    sand: float  # Amount of sand available
    age: int  # Age of the colony
    map: str  # Map associated with the colony
    perkPurchased: List[str]  # List of perks purchased by the colony
    initialized: bool  # Indicates if the colony has been initialized

    class Settings:
        name = "colonies"  # MongoDB collection name

    @classmethod
    def initialize_default(cls, userId: str) -> "Colony":
        return cls(
            id=userId,
            name="",
            ants=[],
            mapEntities=[],
            enemies=[],
            fruits=[],
            eggs=0,
            food=0,
            sand=0,
            age=0,
            map="",
            perkPurchased=[],
            initialized = False,
        )
    

colonyRouter = APIRouter()


@colonyRouter.get("/{id}", response_model=Colony)
async def get_colony(id: str):
    print("Fetching colony with ID:", id)
    try:
        colony = await Colony.get(id)
    except ValidationError as e:
        print("Validation error, resetting colony:", e)
        colony = await Colony.initialize_default(id)
        return colony

    if not colony:
        raise HTTPException(status_code=404, detail="Colony not found")
    return colony


@colonyRouter.put("/{id}", response_model=dict)
async def update_colony(id: str, request: Request):
    existing_colony = await Colony.get(id)
    if not existing_colony:
        raise HTTPException(status_code=404, detail="Colony not found")
    
    data = await request.json()
    for field, value in data.items():
        if hasattr(existing_colony, field):
            setattr(existing_colony, field, value)
    await existing_colony.save()
    return {"message": f"Colony with ID '{id}' has been updated"}
    

async def ensure_guest_colony_exists(reinitialize: bool = False):
    guest_colony = None
    try:
        guest_colony = await Colony.get("guest")

    except ValidationError as e:
        print("Guest colony validation failed:", e)
        print("Deleting mismatched guest colony...")
        await Colony.find(Colony.id == "guest").delete()
        guest_colony = None
    
    except Exception as e:
        print("Error fetching guest colony:", e)
        guest_colony = None

    # Reinitialize the guest colony if it doesn't exist or reinitialize is True
    if not guest_colony or reinitialize:
        if guest_colony and reinitialize:
            print("Reinitializing guest colony...")
            await guest_colony.delete()
        guest_colony = Colony.initialize_default("guest")
        await guest_colony.insert()
        print("Guest colony created:", guest_colony)
    else:
        print("Guest colony already exists and is valid:", guest_colony)


# def migrate_colony(old_verison, new_version):
#     pass