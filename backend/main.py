from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import initialize_database

from routers.colony import colonyRouter
from routers.profile import profileRouter
from routers.trades import tradesRouter
from routers.clan import clanRouter
from middleware.auth import AuthMiddleware

import logging


file_handler = logging.FileHandler("app.log")
file_handler.setFormatter(
    logging.Formatter("%(asctime)s: %(name)s: %(levelname).4s: %(message)s")
)

console_handler = logging.StreamHandler()
console_handler.setFormatter(
    logging.Formatter("%(asctime)s: %(name)s: %(levelname).4s: %(message)s")
)
logging.basicConfig(
    level=logging.INFO,
    handlers=[file_handler, console_handler],
    format="%(asctime)s: %(name)s: %(levelname).4s: %(message)s",
)




@asynccontextmanager
async def lifespan(app: FastAPI):
    await initialize_database()
    yield

app = FastAPI(title="Clash of Colonies", version="0.1.0", lifespan=lifespan)

app.add_middleware(AuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(colonyRouter, prefix="/colonies")
app.include_router(profileRouter, prefix="/profiles")
app.include_router(clanRouter, prefix="/clan")
app.include_router(tradesRouter, prefix="/trades")

@app.get("/")
async def welcome() -> dict:
    return {"msg": "Greetings, ant boss."}
