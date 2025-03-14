from typing import Any, ClassVar, Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator, ValidationError, model_validator, root_validator
import random

"""
This file contains the base classes and functions that are used by the other files in the project.
"""

current_id = 0

class Unit(BaseModel):
    id: int
    name: str
    age: int

    # for some reason this below does not work, each subclass would have their own id counter
    # current_id: ClassVar[int] = 0 # the global id counter

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

    def advance_time_cycle(self):
        self.age += 1


    # this tells pydantic to treat class attributes as fields
    class Config:
        from_attributes = True

class advanceTimeCycleRequest(BaseModel):
    time: int
    
    @field_validator('time')
    def validate_time(cls, time):
        if time < 1:
            raise ValueError('Time must be at least 1')
        return time