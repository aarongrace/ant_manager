from enum import Enum
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator, ValidationError

from unit_base_class import Unit 

broods_router = APIRouter()
class StageType(str, Enum):
    egg = "Egg"
    larva = "Larva"
    pupa = "Pupa"


class BroodUnit(Unit):
    stage_type: StageType
    caredBy: int
    potential: int

    @field_validator('potential')
    def validate_potential(cls, potential):
        if not (1 <= potential <= 100):
            raise ValueError('Potential must be between 1 and 100')
        return potential

broods_list = []

def add_brood_unit(name: str, stage: StageType, age: int, potential: int, caredBy: int = 0) -> BroodUnit:
    print("here")
    new_unit = BroodUnit(name=name, stage_type=stage, age=age, potential=potential, caredBy=caredBy)
    print(new_unit)
    broods_list.append(new_unit)
    return new_unit


@broods_router.get("", response_model=List[BroodUnit])
async def get_brood_units(stage_type: StageType = None) -> List[BroodUnit]:
    filtered_units = broods_list
    if stage_type:
        filtered_units = [unit for unit in filtered_units if unit.stage_type == stage_type]
    print(filtered_units)
    return filtered_units

@broods_router.get("/{unit_id}", response_model=BroodUnit)
async def get_brood_unit(unit_id: int) -> BroodUnit:
    for unit in broods_list:
        if unit.id == unit_id:
            return unit
    raise HTTPException(status_code=404, detail="Unit not found")

@broods_router.put("/{unit_id}", response_model=BroodUnit)
async def update_brood_unit(unit_id: int, unit: BroodUnit) -> BroodUnit:
    for i, u in enumerate(broods_list):
        if u.id == unit_id:
            broods_list[i] = unit
            return unit
    raise HTTPException(status_code=404, detail="Unit not found")

@broods_router.post("")
async def add_brood_unit_endpoint(unit_data: dict) -> BroodUnit:
    try:
        return add_brood_unit(unit_data["name"], unit_data["stageType"], unit_data["age"], unit_data["potential"], unit_data["caredBy"])
    except ValidationError as e:
        raise HTTPException(status_code=400, detail="Validation error") from e

@broods_router.delete("/{unit_id}", response_model=dict)
async def delete_brood_unit(unit_id: int) -> dict:
    for i, unit in enumerate(broods_list):
        if unit.id == unit_id:
            del broods_list[i]
            return {"msg": "unit deleted"}
    raise HTTPException(status_code=404, detail="Unit not found")