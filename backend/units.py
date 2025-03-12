from enum import Enum
from typing import List, Union, Optional
from fastapi import APIRouter
from pydantic import BaseModel, field_validator, Field, ValidationError

class UnitType(str, Enum):
    queen = "Queen"
    worker = "Worker"
    soldier = "Soldier"
    brood = "Brood"

class TaskType(str, Enum):
    idle = "Idle"
    forage = "Forage"
    build = "Build"
    patrol = "Patrol"
    lay_eggs = "Lay Eggs"

class StageType(str, Enum):
    egg = "Egg"
    larva = "Larva"
    pupa = "Pupa"

class Unit(BaseModel):
    id: int
    name: str
    age: int
    isAdult: bool

    class Config:
        from_attributes = True

class AdultUnit(Unit):
    unit_type: UnitType
    productivity: int
    task: TaskType

    @field_validator('productivity')
    def validate_productivity(cls, productivity):
        if not (1 <= productivity <= 100):
            raise ValueError('Productivity must be between 1 and 100')
        return productivity

    @field_validator('task')
    def validate_task(cls, task, info):
        unit_type = info.data.get('unit_type')
        if unit_type == UnitType.queen and task not in {TaskType.lay_eggs, TaskType.idle}:
            raise ValueError(f'Queens can only do lay eggs, idle tasks, not {task}')
        if unit_type == UnitType.worker and task not in {TaskType.idle, TaskType.forage, TaskType.build}:
            raise ValueError(f'Workers can only do idle, forage, or build tasks, not {task}')
        if unit_type == UnitType.soldier and task not in {TaskType.idle, TaskType.forage, TaskType.patrol}:
            raise ValueError(f'Soldiers can only do idle, forage, or patrol tasks, not {task}')
        return task

class BroodUnit(Unit):
    stage_type: StageType
    caredBy: int
    potential: int

    @field_validator('potential')
    def validate_potential(cls, potential):
        if not (1 <= potential <= 100):
            raise ValueError('Potential must be between 1 and 100')
        return potential

    @field_validator('caredBy')
    def validate_caredBy(cls, caredBy):
        if caredBy != 0 and not any(unit.id == caredBy for unit in unit_list):
            raise ValueError('caredBy must be 0 or a valid unit ID')
        return caredBy

unit_router = APIRouter()

unit_list: List[Unit] = []

def add_adult_unit(name: str, unit_type: UnitType, productivity: int, task: TaskType, age: int) -> AdultUnit:
    global unit_list
    new_id = max((unit.id for unit in unit_list), default=0) + 1
    new_unit = AdultUnit(id=new_id, name=name, unit_type=unit_type, productivity=productivity, task=task, age=age, isAdult=True)
    unit_list.append(new_unit)
    return new_unit

def add_brood_unit(name: str, stage: StageType, age: int, potential: int, caredBy: int = 0) -> BroodUnit:
    global unit_list
    new_id = max((unit.id for unit in unit_list), default=0) + 1
    new_unit = BroodUnit(id=new_id, name=name, unit_type=UnitType.brood, stage_type=stage, age=age, potential=potential, caredBy=caredBy, isAdult=False)
    unit_list.append(new_unit)
    return new_unit

def initialize_default_unit_list():
    add_adult_unit("Antonia", UnitType.queen, 20, TaskType.lay_eggs, 5)
    add_adult_unit("Alice", UnitType.worker, 50, TaskType.idle, 2)
    add_adult_unit("Bob", UnitType.worker, 50, TaskType.forage, 3)
    add_adult_unit("Charlie", UnitType.soldier, 60, TaskType.patrol, 4)
    add_brood_unit("Broodity", StageType.egg, 0, 50)

initialize_default_unit_list()

@unit_router.get("")
async def get_units(unit_type = None) -> dict:
    if unit_type:
        filtered_units = [unit for unit in unit_list if unit.unit_type == unit_type]
    else:
        filtered_units = unit_list
    return {"units": filtered_units}

@unit_router.get("/{unit_id}")
async def get_unit(unit_id: int) -> Unit:
    for unit in unit_list:
        if unit.id == unit_id:
            return unit
    return {"msg": "unit not found"}

@unit_router.put("/{unit_id}")
async def update_unit(unit_id: int, unit: Unit) -> dict:
    for i, u in enumerate(unit_list):
        if u.id == unit_id:
            unit_list[i] = unit
            return {"msg": "unit updated", "unit": unit}
    return {"msg": "unit not found"}

@unit_router.post("")
async def add_unit(unit: Unit) -> dict:
    try:
        unit_list.append(unit)
        return {"msg": "new unit added", "unit": unit}
    except ValidationError as e:
        return {"msg": "validation error", "errors": e.errors()}