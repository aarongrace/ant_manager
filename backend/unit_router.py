from enum import Enum
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator, ValidationError
from broods import StageType, add_brood_unit, broods_list, broods_router
from adults import TaskType, add_adult_unit, UnitType, adults_list, adults_router

unit_list = {"adults": adults_list, "broods": broods_list}

unit_router = APIRouter()
unit_router.include_router(adults_router, prefix="/adults")
unit_router.include_router(broods_router, prefix="/broods")

@unit_router.get("", response_model=dict)
async def get_units() -> dict:
    return unit_list



def initialize_default_unit_list():
    add_adult_unit("Antonia", UnitType.queen, 20, TaskType.lay_eggs, 5)
    add_adult_unit("Alice", UnitType.worker, 50, TaskType.idle, 2)
    add_adult_unit("Bob", UnitType.worker, 50, TaskType.forage, 3)
    add_adult_unit("Charlie", UnitType.soldier, 60, TaskType.patrol, 4)
    add_brood_unit("Broodity", StageType.egg, 0, 50)

is_initialized = False
if not is_initialized:
    initialize_default_unit_list()
    is_initialized = True