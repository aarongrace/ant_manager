from enum import Enum

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from units import unit_router

app = FastAPI()
app.include_router(unit_router, tags=["units"], prefix="/units")

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

