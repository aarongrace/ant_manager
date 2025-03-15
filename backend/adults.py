from enum import Enum
import random
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator, ValidationError
from base_classes import Unit
from ant_names import ant_names

adults_router = APIRouter()

class TaskType(str, Enum):
    idle = "Idle"
    forage = "Forage"
    build = "Build"
    patrol = "Patrol"
    lay_eggs = "Lay Eggs"

class UnitType(str, Enum):
    queen = "Queen"
    worker = "Worker"
    soldier = "Soldier"
    brood = "Brood"

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

    def advance_time_cycle(self):
        super().advance_time_cycle()
        luck = random.random()
        death_factor = self.get_death_factor()
        if luck * death_factor < self.age:
            self.die()
        self.do_tasks()

    # average age is basically death_factor/2

    def get_death_factor(self) -> int:
        if self.unit_type == UnitType.queen:
            return 12000  # 16.4years
        elif self.unit_type == UnitType.worker:
            return 400 # 6.6 months
        elif self.unit_type == UnitType.soldier:
            return 600  # 10 months
        return 1000  # Default factor

    def die(self):
        adults_list.remove(self)

    def do_tasks(self):
        luck = random.random()
        if luck * 50 < self.productivity:  # Chance of doing the task
            if self.task == TaskType.lay_eggs:
                self.lay_egg(random.random() * 5 + 1)

    def lay_egg(self, egg_count):
        while egg_count>0:

            from broods import add_brood_unit, StageType
            new_name = random.choice(ant_names)
            potential = random.randint(1, 100)
            add_brood_unit(new_name, StageType.egg, 0, potential, caredBy=0)

            egg_count -= 1

adults_list: List[AdultUnit] = []

def add_adult_unit(name: str, unit_type: UnitType, productivity: int, task: TaskType, age: int) -> AdultUnit:

    if unit_type == UnitType.queen:
        queen_count = len([u for u in adults_list if u.unit_type == UnitType.queen])
        if (queen_count >= 2):
            unit_type = UnitType.worker
            task = TaskType.forage

    new_unit = AdultUnit(name=name, unit_type=unit_type, productivity=productivity, task=task, age=age)
    adults_list.append(new_unit)
    return new_unit

@adults_router.get("", response_model=List[AdultUnit])
async def get_adult_units(unit_type: UnitType = None) -> List[AdultUnit]:
    filtered_units = adults_list
    if unit_type:
        filtered_units = [unit for unit in filtered_units if unit.unit_type == unit_type]
    return filtered_units

@adults_router.get("/{unit_id}", response_model=AdultUnit)
async def get_adult_unit(unit_id: int) -> AdultUnit:
    for unit in adults_list:
        if unit.id == unit_id:
            return unit
    raise HTTPException(status_code=404, detail="Unit not found")

@adults_router.put("/{unit_id}")
async def update_adult_unit(unit_id: int, unit: AdultUnit) -> AdultUnit:
    for i, u in enumerate(adults_list):
        if u.id == unit_id:
            adults_list[i] = unit
            return unit
    raise HTTPException(status_code=404, detail="Unit not found")

@adults_router.post("", response_model=AdultUnit)
async def add_adult_unit_endpoint(unit_data: dict) -> AdultUnit:
    try:
        new_unit = AdultUnit(**unit_data)
        adults_list.append(new_unit)
        return new_unit
    except ValidationError as e:
        raise HTTPException(status_code=400, detail="Validation error") from e

@adults_router.delete("/{unit_id}", response_model=dict)
async def delete_adult_unit(unit_id: int) -> dict:
    for i, unit in enumerate(adults_list):
        if unit.id == unit_id:
            del adults_list[i]
            return {"msg": "unit deleted"}
    raise HTTPException(status_code=404, detail="Unit not found")