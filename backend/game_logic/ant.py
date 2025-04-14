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
    frame: int  # Frame index for animation or sprite


def random_dark_color():
    # Generate random RGB values in the range 0–100 for a dark color
    r = random.randint(0, 100)
    g = random.randint(0, 100)
    b = random.randint(0, 100)
    # Convert to a hex color string
    return f"#{r:02x}{g:02x}{b:02x}"


def make_new_ant(ant_name=random.choice(ant_names), type=random.choice([TypeEnum.worker, TypeEnum.soldier]), 
                 task=TaskEnum.idle, position={"x": random.uniform(0, 1), "y": random.uniform(0, 1)},
                 age=0, destination="", frame=random.randint(0, 10)):
    return Ant(
        id=str(uuid4()),
        name=ant_name,
        age=age,
        type=type,
        task=task,
        position=position,
        destination=destination,
        amountCarried=0,
        carrying="",
        frame=frame
    )

def initialize_guest_ants():
    return [
        make_new_ant(
            ant_name="Queenie",
            type=TypeEnum.queen,
            task=TaskEnum.idle,
            position={"x": 0.2, "y": 0.5},
            age=2,
            destination="",
            frame=0,  # Initial frame for Queenie
        ),
        make_new_ant(
            ant_name="Worker",
            type=TypeEnum.worker,
            task=TaskEnum.foraging,
            position={"x": 0.2, "y": 0.8},
            age=1,
            destination="",
            frame=1,  # Initial frame for Worker
        ),
    ]
