from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Annotated, List
from beanie import Document
from pydantic import ValidationError

from game_logic.perk import Perk
from game_logic.enemy import Enemy
from game_logic.fruit import Fruit
from game_logic.ant import Ant
from game_logic.map_entity import MapEntity

import logging

# todo implement batch logic. Right now the updates are not just too frequent, but handling actions in a different router means that if it coincides with the put request, the action gets overwritten
# either we add a buffer in memory or we handle all the actions on the frontend and fetch less often

logger = logging.getLogger(__name__)


class Colony(Document):
    id: str  # The colony ID should always be the same as the user ID
    name: str  # Name of the colony
    ants: List[Ant]  # Number of ants in the colony
    mapEntities: List[MapEntity]
    enemies: List[Enemy]
    fruits: List[Fruit]
    eggs: int = 5  # Number of eggs in the colony, defaulted to 5
    food: float  # Amount of food available
    chitin: float  # Amount of chitin available
    age: int  # Age of the colony
    map: List[List[List]]  # Map associated with the colony
    perks: List[Perk]  # List of perks purchased by the colony
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
            chitin=0,
            age=0,
            map=[[]],
            perks=[],
            initialized = False,
        )
    

colonyRouter = APIRouter()


async def get_colony_by_id(colony_id: str) -> Colony:
    try:
        colony = await Colony.get(colony_id)
        if not colony:
            raise HTTPException(status_code=404, detail="Colony not found")
    except ValidationError as e:
        logger.warning(f"Validation error while fetching colony: {e}")
        colony = Colony.initialize_default(colony_id)
        return colony
    return colony



@colonyRouter.get("/{id}", response_model=Colony)   
async def get_colony(colony: Annotated[Colony, Depends(get_colony_by_id)]):
    logger.info(f"Fetching colony with ID: {colony.id}")
    return colony

# @colonyRouter.get("/{id}", response_model=Colony)
# async def get_colony(id: str):
#     logger.info(f"Fetching colony with ID: {id}")
#     try:
#         colony = await Colony.get(id)
#     except ValidationError as e:
#         logger.warning(f"Validation error while fetching colony: {e}")
#         colony = Colony.initialize_default(id)
#         return colony

#     if not colony:
#         raise HTTPException(status_code=404, detail="Colony not found")
#     return colony


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
        logger.warning(f"Validation error while fetching guest colony: {e}")
        logger.warning("Deleting mismatched guest colony...")
        await Colony.find(Colony.id == "guest").delete()
        guest_colony = None
    
    except Exception as e:
        logger.warning(f"Error while fetching guest colony: {e}")
        guest_colony = None

    # Reinitialize the guest colony if it doesn't exist or reinitialize is True
    if not guest_colony or reinitialize:
        if guest_colony and reinitialize:
            logger.info("Reinitializing guest colony...")
            await guest_colony.delete()
        guest_colony = Colony.initialize_default("guest")
        await guest_colony.insert()
        logger.info(f"Guest colony initialized: {guest_colony}")
    else:
        logger.info(f"Guest colony already exists: {guest_colony}")
    
async def ensure_all_colonies_valid():
    raw_colonies = await Colony.get_motor_collection().find().to_list(None)
    logger.info(f"Existing colonies in database: {len(raw_colonies)}")
    counter = 0
    for raw in raw_colonies:
        try:
            Colony.model_validate(raw)
        except ValidationError as e:
            colony_id = raw.get("_id")
            logger.warning(f"Validation error for colony {colony_id}: {e}")
            await Colony.get_motor_collection().delete_one({"_id": colony_id})
            new_colony = Colony.initialize_default(colony_id)
            await new_colony.insert()
            logger.info(f"New colony created for {colony_id}: {new_colony}")
            counter += 1
    logger.info(f"Validation complete. {counter} colonies have been reset")

    