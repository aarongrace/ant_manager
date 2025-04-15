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
    objective: str  # ID of the objective entity the ant is interacting with
    destination: str  # ID of the object the ant is heading to
    carrying: str  # ID of the map entity that it is carrying
    amountCarried: int  # Amount of resource the ant is carrying
    carryingCapacity: int  # Maximum carrying capacity of the ant
    speed: float  # Speed of the ant
    sizeFactor: float = 1.0  # Size factor of the ant, default is 1

def make_new_ant(ant_name=random.choice(ant_names), type=random.choice([TypeEnum.worker, TypeEnum.soldier]), 
                 task=TaskEnum.idle, position={"x": random.uniform(0, 1), "y": random.uniform(0, 1)},
                 age=0, objective="", destination="", speed=1.0):
    carrying_capacity = 5 if type == TypeEnum.worker else 7  # Example logic for carrying capacity
    return Ant(
        id=str(uuid4()),
        name=ant_name,
        age=age,
        type=type,
        task=task,
        position=position,
        objective=objective,
        destination=destination,
        amountCarried=0,
        carryingCapacity=carrying_capacity,  # Initialize carrying capacity
        carrying="",
        speed=speed,
        sizeFactor=1.0  # Initialize size factor to 1
    )

def initialize_guest_ants():
    return [
        make_new_ant(
            ant_name="Queenie",
            type=TypeEnum.queen,
            task=TaskEnum.idle,
            position={"x": 0.82, "y": 0.69},
            age=2,
            objective="",
            destination="",
            speed=0.00005
        ),
        make_new_ant(
            ant_name="Worker",
            type=TypeEnum.worker,
            task=TaskEnum.foraging,
            position={"x": 0.2, "y": 0.8},
            age=1,
            objective="",
            destination="",
            speed=0.0001
        ),
    ]
