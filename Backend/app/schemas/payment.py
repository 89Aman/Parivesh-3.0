from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class PaymentSimulateRequest(BaseModel):
    amount: float


class PaymentOut(BaseModel):
    id: int
    application_id: UUID
    amount: float
    status: str
    transaction_ref: Optional[str] = None
    initiated_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
