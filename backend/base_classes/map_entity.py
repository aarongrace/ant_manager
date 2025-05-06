from pydantic import BaseModel
from enum import Enum

class EntityTypeEnum(str, Enum):
    gateway = "gateway"
    foodResource = "foodResource"


class MapEntity(BaseModel):
    id: str  # Unique identifier for the map entity
    type: EntityTypeEnum  # Type of the entity (e.g., gateway, foodResource)
    coords: dict  # Absolute coordinates of the entity (e.g., {"x": -100, "y": 50})
    size: dict  # Size of the entity (e.g., {"width": 10, "height": 20})
    amount: float  # Amount of the resource (if applicable)
    imgName: str  # Name of the image associated with the entity
