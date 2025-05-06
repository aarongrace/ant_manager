from enum import Enum
from typing import Optional

from pydantic import BaseModel
class Perk(BaseModel):
    name: str
    type: Optional[str]
    timesUpgraded: Optional[int]
    isPurchased: Optional[bool]
    isUpgrade: bool
