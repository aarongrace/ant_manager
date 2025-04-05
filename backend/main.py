from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import initialize_database

from routers.colony import colonyRouter
from routers.profile import profileRouter
from routers.actions import actionsRouter

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for the FastAPI application.
    This function is called when the application starts up and shuts down.
    """
    # Perform startup actions here
    await initialize_database()
    yield
    # Perform shutdown actions here


app = FastAPI(title="Clash of Colonies", version="0.1.0", lifespan=lifespan)
app.include_router(colonyRouter, prefix="/colonies")
app.include_router(actionsRouter, prefix="/actions")
app.include_router(profileRouter, prefix="/profiles")

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
