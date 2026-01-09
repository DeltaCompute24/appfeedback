from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserCreditsResponse(BaseModel):
    id: UUID
    user_id: str
    x_handle: Optional[str]
    credits_balance: int
    credits_earned_total: int
    items_submitted: int
    items_developed: int
    created_at: datetime

    class Config:
        from_attributes = True


class CreditTransactionResponse(BaseModel):
    id: UUID
    user_id: str
    item_id: Optional[UUID]
    amount: int
    transaction_type: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
