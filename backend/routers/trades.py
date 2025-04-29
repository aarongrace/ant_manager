from fastapi import APIRouter, HTTPException, Request
from beanie import Document
from pydantic import BaseModel
from datetime import datetime
import uuid

tradesRouter = APIRouter()

class TradeOfferBase(BaseModel):
    from_user_id: str
    to_user_id: str
    offer_resource: str  # 'food' or 'chitin'
    offer_amount: int
    request_resource: str  # 'food' or 'chitin'
    request_amount: int

class Trade(Document):
    id: str
    from_user_id: str
    to_user_id: str
    offer_resource: str
    offer_amount: int
    request_resource: str
    request_amount: int
    status: str  # pending, accepted, declined
    created_at: datetime

    class Settings:
        name = "trades"

@tradesRouter.post("/send")
async def send_trade(offer: TradeOfferBase):
    trade = Trade(
        id=str(uuid.uuid4()),
        from_user_id=offer.from_user_id,
        to_user_id=offer.to_user_id,
        offer_resource=offer.offer_resource,
        offer_amount=offer.offer_amount,
        request_resource=offer.request_resource,
        request_amount=offer.request_amount,
        status="pending",
        created_at=datetime.utcnow()
    )
    await trade.insert()
    return {"status": "success", "message": "Trade offer sent", "trade_id": trade.id}

@tradesRouter.get("/pending/{user_id}")
async def get_pending_trades(user_id: str):
    trades = await Trade.find(
        {"to_user_id": user_id, "status": "pending"}
    ).to_list()
    return trades

@tradesRouter.post("/accept/{trade_id}")
async def accept_trade(trade_id: str):
    trade = await Trade.get(trade_id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    from routers.colony import Colony

    sender_colony = await Colony.get(trade.from_user_id)
    receiver_colony = await Colony.get(trade.to_user_id)

    if not sender_colony or not receiver_colony:
        raise HTTPException(status_code=404, detail="One of the colonies not found")

    receiver_resource_amount = getattr(receiver_colony, trade.request_resource, 0)
    if receiver_resource_amount < trade.request_amount:
        raise HTTPException(status_code=400, detail="Receiver doesn't have enough resources")

    setattr(sender_colony, trade.offer_resource, getattr(sender_colony, trade.offer_resource, 0) - trade.offer_amount)
    setattr(receiver_colony, trade.request_resource, getattr(receiver_colony, trade.request_resource, 0) - trade.request_amount)

    setattr(sender_colony, trade.request_resource, getattr(sender_colony, trade.request_resource, 0) + trade.request_amount)
    setattr(receiver_colony, trade.offer_resource, getattr(receiver_colony, trade.offer_resource, 0) + trade.offer_amount)

    await sender_colony.save()
    await receiver_colony.save()

    trade.status = "accepted"
    await trade.save()

    return {"status": "success", "message": "Trade accepted and resources updated"}


@tradesRouter.post("/decline/{trade_id}")
async def decline_trade(trade_id: str):
    trade = await Trade.get(trade_id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    trade.status = "declined"
    await trade.save()
    return {"status": "success", "message": "Trade declined"}
