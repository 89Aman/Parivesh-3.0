import enum
from sqlalchemy import (
    Column, String, DateTime, func, ForeignKey, Integer,
    Numeric, Text, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.core.db import Base


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    INITIATED = "INITIATED"
    VERIFIED = "VERIFIED"
    FAILED = "FAILED"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    transaction_ref = Column(String, nullable=True)
    gateway_payload = Column(JSONB, nullable=True)
    initiated_at = Column(DateTime(timezone=True), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    application = relationship("Application", back_populates="payment")
