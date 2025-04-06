from fastapi import APIRouter, HTTPException
from .colony import Colony
from game_logic.ant import make_new_ant
actionsRouter = APIRouter()



@actionsRouter.post("/makeAnt", response_model=dict)
async def make_ant(id: str):
    print(f"Creating an ant in colony '{id}'")
    colony = await Colony.get(id)
    if not colony:
        raise HTTPException(status_code=404, detail="Colony not found")

    if colony.eggs <= 0:
        raise HTTPException(status_code=400, detail="Not enough eggs to create an ant") 
    
    if colony.food < 20:
        raise HTTPException(status_code=400, detail="Not enough food to create an ant")

    colony.food -= 10
    colony.eggs -= 1
    colony.ants.append(make_new_ant())
    await colony.save()
    return {"message": "Ant created successfully"}
