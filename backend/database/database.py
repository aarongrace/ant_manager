import asyncio
from typing import Optional
import beanie
from motor.motor_asyncio import AsyncIOMotorClient

from beanie import Document, Indexed
from pydantic import BaseModel

class Category(BaseModel):
    name: str
    description: str

class Product(Document):
    name: str
    description: Optional[str] = None


async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017/my_database")

    # default_database = client.get_default_database()
    # await beanie.init_beanie(database=default_database, document_models=[Product])
    # print(default_database)

    server_info = await client.server_info()
    print(server_info)
    # databases = await client.list_database_names()
    # print("finished")
    # print(databases)
    prod = Product(name="test")
    await prod.insert()






    
asyncio.run(
    main()
)



