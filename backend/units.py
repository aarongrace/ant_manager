from enum import Enum
from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

class UnitType(str, Enum):
    settler = "Settler"
    robot = "Robot"
    livestock = "Livestock"

class Unit(BaseModel):
    id: int
    unit_type: UnitType
    name: str
    productivity: int


unit_router = APIRouter()

unit_list: List[Unit] = [
    Unit(id=1, name="Unit A", unit_type=UnitType.settler, productivity=50),
    Unit(id=2, name="Unit B", unit_type=UnitType.robot, productivity=60),
    Unit(id=3, name="Unit C", unit_type=UnitType.livestock, productivity=70)
]



@unit_router.get("")
async def get_units() -> dict:
    return {"units": unit_list}

@unit_router.get("/{unit_id}")
async def get_unit(unit_id: int) -> Unit:
    for unit in unit_list:
        if unit.id == unit_id:
            return unit
    return {"msg": "unit not found"}    

@unit_router.post("")
async def add_unit(unit: Unit) -> dict:
    unit_list.append(unit)
    return {"msg": "new todo added", "unit": unit}