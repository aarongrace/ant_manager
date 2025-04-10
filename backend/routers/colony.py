from fastapi import APIRouter, HTTPException, Request
from typing import List
from beanie import Document

from game_logic.ant import Ant, make_new_ant, TypeEnum, TaskEnum
from game_logic.map_entity import MapEntity, EntityTypeEnum, initialize_guest_map_entities


# todo implement batch logic. Right now the updates are not just too frequent, but handling actions in a different router means that if it coincides with the put request, the action gets overwritten
# either we add a buffer in memory or we handle all the actions on the frontend and fetch less often

class Colony(Document):
    id: str  # The colony ID should always be the same as the user ID
    name: str  # Name of the colony
    ants: List[Ant]  # Number of ants in the colony
    mapEntities: List[MapEntity]
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
            make_new_ant(
                ant_name="Queenie",
                type=TypeEnum.queen,
                task=TaskEnum.idle,
                position={"x": 0.2, "y": 0.5},
                age=2,
                destination="",
                color="#FF0000",  # Hex color for red
            ),
            make_new_ant(
                ant_name="Worker",
                type=TypeEnum.worker,
                task=TaskEnum.foraging,
                position={"x": 0.2, "y": 0.8},
                age=1,
                destination="",
                color="#008000",  # Hex color for green
            ),
        ]     

        return cls(
            id=userId,
            name="Antopia",
            ants=ants,
            mapEntities=initialize_guest_map_entities(),
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

    guest_colony = await Colony.get("guest")

    if guest_colony and reinitialize:
        print("Right now the guest colony is being reinitialized every time")
        await guest_colony.delete()
        print("Guest colony deleted.")
    
    if not guest_colony or reinitialize:
        guest_colony = Colony.initialize_default("guest")
        await guest_colony.insert()
        print("Guest colony created:", guest_colony)
    else:
        print("Guest colony already exists:", guest_colony)
