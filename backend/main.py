from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import initialize_database

from routers.colony import colonyRouter
from routers.profile import profileRouter
from routers.clan import clanRouter
from middleware.auth import AuthMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    await initialize_database()
    yield

app = FastAPI(title="Clash of Colonies", version="0.1.0", lifespan=lifespan)

app.add_middleware(AuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(colonyRouter, prefix="/colonies")
app.include_router(profileRouter, prefix="/profiles")
app.include_router(clanRouter, prefix="/clan")

@app.get("/")
async def welcome() -> dict:
    return {"msg": "Greetings, ant boss."}
