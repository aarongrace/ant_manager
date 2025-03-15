from enum import Enum
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator, ValidationError
from broods import StageType, add_brood_unit, broods_list, broods_router
from adults import TaskType, add_adult_unit, UnitType, adults_list, adults_router
from base_classes import Unit

unit_list = {"adults": adults_list, "broods": broods_list}

unit_router = APIRouter()
unit_router.include_router(adults_router, prefix="/adults")
unit_router.include_router(broods_router, prefix="/broods")

@unit_router.get("", response_model=dict)
async def get_units() -> dict:
    return unit_list

@unit_router.get("/{unit_id}")
async def get_unit(unit_id: int) -> Unit:
    for unit_type in unit_list:
        for unit in unit_list[unit_type]:
            if unit.id == unit_id:
                return unit
    raise HTTPException(status_code=404, detail="Unit not found")


@unit_router.delete("/{unit_id}")
async def delete_unit(unit_id: int) -> dict:
    for unit_type in unit_list:
        for i, unit in enumerate(unit_list[unit_type]):
            if unit.id == unit_id:
                del unit_list[unit_type][i]
                return {"msg": "unit deleted"}


@unit_router.post("/reset")
async def reset_units():
    broods_list.clear()
    adults_list.clear()
    initialize_default_unit_list()


def advance_units(times: int) -> None:
    while times > 0:
        for unit in adults_list:
            unit.advance_time_cycle()
        for unit in broods_list:
            unit.advance_time_cycle()
        times -= 1



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