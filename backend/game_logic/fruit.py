import random
from pydantic import BaseModel
from enum import Enum
from uuid import uuid4


class Fruit(BaseModel):
    id: str  # Unique identifier for the map entity
    coords: dict  # Absolute coordinates of the entity (e.g., {"x": -100, "y": 50})
    size: dict
    amount: float  # Amount of the resource (if applicable)
    col: int  # Column of the grid
    row: int  # Row of the grid
    stage: int  # Stage of the fruit (0-2)


