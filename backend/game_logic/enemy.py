from pydantic import BaseModel
from enum import Enum
from typing import Dict


class EnemyTypeEnum(str, Enum):
    maggot = "maggot"
    mantis = "mantis"
    beetle = "beetle"


class Enemy(BaseModel):
    id: str  # Unique identifier for the enemy
    type: EnemyTypeEnum  # Type of the enemy (e.g., maggot, mantis, beetle)
    coords: Dict[str, float]  # Coordinates of the enemy (e.g., {"x": 100, "y": 200})
    hp: int  # Health points of the enemy
    speed: float  # Speed of the enemy