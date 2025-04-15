import random
from pydantic import BaseModel
from enum import Enum
from uuid import uuid4

from .ant_names import ant_names


class TypeEnum(str, Enum):
    queen = "queen"
    worker = "worker"
    soldier = "soldier"

class TaskEnum(str, Enum):
    idle = "idle"
    foraging = "foraging"
    attacking = "attacking"

class Ant(BaseModel):
    id: str  # Unique identifier for the ant
    name: str  # Name of the ant
    age: int  # Age of the ant
    type: str  # Type of the ant (e.g., worker, soldier, queen)
    task: TaskEnum  # Current task of the ant
    position: dict  # Current position of the ant (e.g., {"x": 0, "y": 0})
    destination: str  # ID of the object the ant is heading to
    carrying: str  # ID of the map entity that it is carrying
    amountCarried: int  # Amount of resource the ant is carrying

def make_new_ant(ant_name=random.choice(ant_names), type=random.choice([TypeEnum.worker, TypeEnum.soldier]), 
                 task=TaskEnum.idle, position={"x": random.uniform(0, 1), "y": random.uniform(0, 1)},
                 age=0, destination=""):
    return Ant(
        id=str(uuid4()),
        name=ant_name,
        age=age,
        type=type,
        task=task,
        position=position,
        destination=destination,
        amountCarried=0,
        carrying=""
    )

def initialize_guest_ants():
    return [
        make_new_ant(
            ant_name="Queenie",
            type=TypeEnum.queen,
            task=TaskEnum.idle,
            position={"x": 0.2, "y": 0.5},
            age=2,
            destination=""
        ),
        make_new_ant(
            ant_name="Worker",
            type=TypeEnum.worker,
            task=TaskEnum.foraging,
            position={"x": 0.2, "y": 0.8},
            age=1,
            destination=""
        ),
    ]
