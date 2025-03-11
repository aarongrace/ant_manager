from enum import Enum
from typing import List
from fastapi import APIRouter
from pydantic import BaseModel, field_validator
from pydantic.error_wrappers import ValidationError

class UnitType(str, Enum):
    queen = "Queen"
    worker = "Worker"
    soldier = "Soldier"

class TaskType(str, Enum):
    idle = "Idle"
    forage = "Forage"
    build = "Build"
    patrol = "Patrol"
    lay_eggs = "Lay Eggs"

class Unit(BaseModel):
    id: int
    unit_type: UnitType
    name: str
    productivity: int
    task: TaskType

    @field_validator('task')
    def validate_task(cls, task, values):
        unit_type = values.data.get('unit_type')
        if unit_type == UnitType.queen and task != TaskType.lay_eggs:
            raise ValueError(f'Queens can only do lay eggs tasks, not {task}')
        if unit_type == UnitType.worker and task not in {TaskType.idle, TaskType.forage, TaskType.build}:
            raise ValueError(f'Workers can only do idle, forage, or build tasks, not {task}')
        if unit_type == UnitType.soldier and task not in {TaskType.idle, TaskType.forage, TaskType.patrol}:
            raise ValueError(f'Soldiers can only do idle, forage, or patrol tasks, not {task}')
        return task

unit_router = APIRouter()

unit_list: List[Unit] = []

def add_unit(name: str, unit_type: UnitType, productivity: int, task: TaskType) -> Unit:
    global unit_list
    if unit_list == []:
        new_id = 1
    else:
        new_id = max(unit.id for unit in unit_list) + 1
    new_unit = Unit(id=new_id, name=name, unit_type=unit_type, productivity=productivity, task=task)
    unit_list.append(new_unit)
    return new_unit

def initialize_default_unit_list():
    add_unit("Queen Antonia", UnitType.queen, 100, TaskType.lay_eggs)
    add_unit("Worker Alice", UnitType.worker, 50, TaskType.idle)
    add_unit("Worker Bob", UnitType.worker, 50, TaskType.forage)
    add_unit("Soldier Charlie", UnitType.soldier, 60, TaskType.patrol)

initialize_default_unit_list()

@unit_router.get("")
async def get_units() -> dict:
    return {"units": unit_list}

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