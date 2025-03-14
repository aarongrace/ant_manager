from enum import Enum
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator, ValidationError
import random

from base_classes import Unit 

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

    def advance_time_cycle(self):
        super().advance_time_cycle()
        maturation_chance = random.random()
        
        # here we have the chance of maturing increase until it reaches 100%
        if self.stage_type == StageType.egg:
            if self.age >= 3 and maturation_chance < (self.age - 2) / 3:  # 3 to 5 days
                self.stage_type = StageType.larva
                self.age = 0 
        elif self.stage_type == StageType.larva:
            if self.age >= 7 and maturation_chance < (self.age - 6) / 14:  # 1 to 3 weeks
                self.stage_type = StageType.pupa
                self.age = 0 
        elif self.stage_type == StageType.pupa:
            if self.age >= 7 and maturation_chance < (self.age - 6) / 14:  # 1 to 2 weeks
                self.transform_to_adult()

    def transform_to_adult(self):
        from adults import add_adult_unit, UnitType, TaskType
        luck = random.random()
        if luck < 0.015:
            unit_type = UnitType.queen
            task = TaskType.lay_eggs
        elif luck < 0.20:
            unit_type = UnitType.soldier
            task = random.choice([TaskType.idle, TaskType.forage, TaskType.patrol])
        else:
            unit_type = UnitType.worker
            task = random.choice([TaskType.idle, TaskType.forage, TaskType.build])
        add_adult_unit(self.name, unit_type, self.potential, task, 0)
        broods_list.remove(self)

broods_list: List[BroodUnit] = []

def add_brood_unit(name: str, stage: StageType, age: int, potential: int, caredBy: int = 0) -> BroodUnit:
    new_unit = BroodUnit(name=name, stage_type=stage, age=age, potential=potential, caredBy=caredBy)
    broods_list.append(new_unit)
    return new_unit

@broods_router.get("", response_model=List[BroodUnit])
async def get_brood_units(stage_type: StageType = None) -> List[BroodUnit]:
    filtered_units = broods_list
    if stage_type:
        filtered_units = [unit for unit in filtered_units if unit.stage_type == stage_type]
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

@broods_router.post("", response_model=BroodUnit)
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