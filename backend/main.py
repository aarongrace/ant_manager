from enum import Enum

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from unit_router import unit_router, advance_units

from pydantic import BaseModel, field_validator, ValidationError
from base_classes import advanceTimeCycleRequest


app = FastAPI()
app.include_router(unit_router, prefix="/units")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def welcome() -> dict:
    """welcome ant boss"""
    return {"msg": "Greetings, ant boss."}


@app.post("/advance")
async def advance_time_cycle(request: advanceTimeCycleRequest) -> dict:
    # the main hub for the advance time cycle
    # eventually the advance command would also be passed to //
    # resources, buildings, pictures and etc.
    time = request.time
    advance_units(time)
    return {"msg": "Time cycle advanced."}
