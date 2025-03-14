from enum import Enum
from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator, ValidationError, model_validator, root_validator

current_id = 1 # the global id counter

class Unit(BaseModel):
    id: int
    name: str
    age: int

    @classmethod
    def get_new_id(cls) -> int:
        global current_id
        current_id += 1
        return current_id

    # so this basically allows me to change the values of the fields 
    @model_validator(mode="before")
    def set_id(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in values:
            values["id"] = cls.get_new_id()
        return values

    # this tells pydantic to treat class attributes as fields
    class Config:
        from_attributes = True

