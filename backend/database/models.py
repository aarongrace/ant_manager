from typing import Optional
from beanie import Document
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class Category(BaseModel):
    name: str
    description: str

class Product(Document):
    name: str
    description: Optional[str] = None

    
class MyConfig(BaseSettings):
    app_name: str
    connection_string: str

    model_config = SettingsConfigDict(env_file="./.env")

