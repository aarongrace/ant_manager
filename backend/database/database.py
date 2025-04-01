import asyncio
from typing import Optional
import beanie
from motor.motor_asyncio import AsyncIOMotorClient

from beanie import Document, Indexed, init_beanie
from pydantic import BaseModel

from models import MyConfig, Product

# WL6lO2aH2CNXngL0

setting = MyConfig()



async def init_db():
    client = AsyncIOMotorClient("mongodb+srv://aarongrace:1234@cluster0.9nvn8.mongodb.net/") 
    databases = await client.list_database_names()
    print(databases)
    # await init_beanie(database=client.get_default_database(), document_models=[Product])
    return client

async def main():
    # client = await init_db()
    print(setting.connection_string)


    # client = AsyncIOMotorClient("mongodb://localhost:27017/my_database")

    # default_database = client.get_default_database()
    # await beanie.init_beanie(database=default_database, document_models=[Product])
    # print(default_database)

    # server_info = await client.server_info()
    # print(server_info)
    # # databases = await client.list_database_names()
    # # print("finished")
    # # print(databases)
    # prod = Product(name="test")
    # await prod.insert()






    
asyncio.run(
    main()
)


