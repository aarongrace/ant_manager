from fastapi import APIRouter, HTTPException
from typing import List
from beanie import Document

from game_logic.ant import Ant

class Colony(Document):
    id: str  # The colony ID should always be the same as the user ID
    name: str  # Name of the colony
    ants: List[Ant]  # Number of ants in the colony
    eggs: int = 5  # Number of eggs in the colony, defaulted to 5
    food: float  # Amount of food available
    sand: float  # Amount of sand available
    age: int  # Age of the colony
    map: str  # Map associated with the colony
    perkPurchased: List[str]  # List of perks purchased by the colony

    class Settings:
        name = "colonies"  # MongoDB collection name

    @classmethod
    def initialize_default(cls, userId: str) -> "Colony":

        ants = [
            Ant(
                id="guest_ant_1",
                name="Marge",
                age=2,
                type="queen",
                color="#00008B",  # Hex color for dark blue
                task="idle",
                position={"x": 0.2, "y": 0.5},
                destination="",
            ),
            Ant(
                id="guest_ant_2",
                name="Bart",
                age=2,
                type="soldier",
                color="#00008B",  # Hex color for dark blue
                task="idle",
                position={"x": 0.3, "y": 0.8},
                destination="",
            ),
        ]     
        
        return cls(
            id=userId,
            name="Antopia",
            ants=ants,
            eggs=50,
            food=600,
            sand=800,
            age=0,
            map="uninitialized",
            perkPurchased=[]
        )
    

colonyRouter = APIRouter()


@colonyRouter.get("/{id}", response_model=Colony)
async def get_colony(id: str):
    print("Fetching colony with ID:", id)
    colony = await Colony.get(id)
    if not colony:
        raise HTTPException(status_code=404, detail="Colony not found")
    return colony

# these endpoints are not necessary because gameplay logic should be handled in the backend

# @colonyRouter.put("/{id}", response_model=Colony)
# async def update_colony(id: str, updated_colony: Colony):
#     existing_colony = await Colony.get(id)
#     if not existing_colony:
#         raise HTTPException(status_code=404, detail="Colony not found")
#     updated_colony.id = id
#     await updated_colony.save()
#     return updated_colony

# @colonyRouter.post("/{id}", response_model=Colony)
# async def create_colony(colony: Colony):
#     existing_colony = await Colony.get(colony.id)
#     if existing_colony:
#         raise HTTPException(status_code=400, detail="Colony already exists")
#     await colony.insert_one()
#     return colony

# @colonyRouter.delete("/{id}", response_model=dict)
# async def delete_colony(id: str):
#     colony = await Colony.get(id)
#     if not colony:
#         raise HTTPException(status_code=404, detail="Colony not found")
#     await colony.delete()
#     return {"message": f"Colony with ID '{id}' has been deleted"}


async def ensure_guest_colony_exists():
    guest_colony = await Colony.get("guest")
    if not guest_colony:
        guest_colony = Colony.initialize_default("guest")
        await guest_colony.insert()
        print("Guest colony created:", guest_colony)
    else:
        print("Guest colony already exists:", guest_colony)
