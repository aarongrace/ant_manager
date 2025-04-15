import random
from pydantic import BaseModel
from enum import Enum
from uuid import uuid4


class EntityTypeEnum(str, Enum):
    gateway = "gateway"
    foodResource = "foodResource"


class MapEntity(BaseModel):
    id: str  # Unique identifier for the map entity
    type: EntityTypeEnum  # Type of the entity (e.g., gateway, foodResource)
    position: dict  # Position of the entity (e.g., {"x": 0, "y": 0})
    size: dict  # Size of the entity (e.g., {"width": 10, "height": 20})
    totalAmount: int  # Total amount of the resource (if applicable)
    remainingAmount: int  # Remaining amount of the resource (if applicable)
    imgName: str  # Name of the image associated with the entity


def make_new_map_entity(entity_type: EntityTypeEnum, total_amount: int = 100, img_name: str = "default.png"):
    return MapEntity(
        id=str(uuid4()),
        type=entity_type,
        position={"x": random.uniform(0, 1), "y": random.uniform(0, 1)},
        size={"width": random.uniform(5, 15), "height": random.uniform(5, 15)},  # Random size
        totalAmount=total_amount,
        remainingAmount=total_amount,
        imgName=img_name,  # Set the image name
    )


def initialize_guest_map_entities():
    return [
        MapEntity(
            id="nest_entrance",
            type=EntityTypeEnum.gateway,
            position={"x": 0.75, "y": 0.5},
            size={"width": 100, "height": 100},  # Added size field
            totalAmount=1,
            remainingAmount=1,
            imgName="nest_entrance",  # Set the image name
        ),
        MapEntity(
            id="ham",
            type=EntityTypeEnum.foodResource,
            position={"x": 0.2, "y": 0.15},
            size={"width": 50, "height": 50},  # Added size field
            totalAmount=50,
            remainingAmount=50,
            imgName="ham"
        ),
    ]