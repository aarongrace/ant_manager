from pydantic import BaseModel
from enum import Enum

class TypeEnum(str, Enum):
    queen = "queen"
    worker = "worker"
    soldier = "soldier"

class TaskEnum(str, Enum):
    idle = "idle"
    forage = "forage"
    attack= "attack"
    patrol = "patrol"

class Ant(BaseModel):
    id: str  # Unique identifier for the ant
    name: str  # Name of the ant
    age: int  # Age of the ant
    type: str  # Type of the ant (e.g., worker, soldier, queen)
    task: TaskEnum  # Current task of the ant
    hp: int
    coords: dict  # Absolute coordinates of the ant (e.g., {"x": -100, "y": 50})
    objective: str  # ID of the objective entity the ant is interacting with
    destination: str  # ID of the object the ant is heading to
    carrying: dict | None  # Resource the ant is carrying 
    carryingCapacity: int  # Maximum carrying capacity of the ant
    speed: float  # Speed of the ant
    sizeFactor: float = 1.0  # Size factor of the ant, default is 1