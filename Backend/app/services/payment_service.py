import uuid as uuid_module
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.payment import Payment, PaymentStatus
from app.models.audit import AuditLog
from app.core.exceptions import NotFoundException, BadRequestException


class PaymentService:

    @staticmethod
    async def simulate_payment(db: AsyncSession, app_id: UUID, amount: float) -> Payment:
        # Check if payment already exists
        result = await db.execute(
            select(Payment).filter(Payment.application_id == app_id)
        )
        existing = result.scalars().first()
        if existing:
            raise BadRequestException("Payment already exists for this application")

        txn_ref = f"UPI-SIM-{uuid_module.uuid4().hex[:12].upper()}"
        payment = Payment(
            application_id=app_id,
            amount=amount,
            status=PaymentStatus.PENDING,
            transaction_ref=txn_ref,
            gateway_payload={"method": "UPI_QR_SIM", "generated_at": datetime.now(timezone.utc).isoformat()},
            initiated_at=datetime.now(timezone.utc),
        )
        db.add(payment)
        await db.flush()
        await db.refresh(payment)
        return payment

    @staticmethod
    async def get_for_application(db: AsyncSession, app_id: UUID) -> Payment | None:
        result = await db.execute(
            select(Payment).filter(Payment.application_id == app_id)
        )
        return result.scalars().first()

    @staticmethod
    async def verify_payment(db: AsyncSession, app_id: UUID, actor_id: UUID) -> Payment:
        result = await db.execute(
            select(Payment).filter(Payment.application_id == app_id)
        )
        payment = result.scalars().first()
        if not payment:
            raise NotFoundException("Payment")
        if payment.status == PaymentStatus.VERIFIED:
            raise BadRequestException("Payment already verified")

        payment.status = PaymentStatus.VERIFIED
        payment.verified_at = datetime.now(timezone.utc)
        db.add(payment)

        audit = AuditLog(
            actor_id=actor_id,
            actor_role="SCRUTINY",
            action="PAYMENT_VERIFIED",
            description=f"Payment verified for application {app_id}, txn_ref={payment.transaction_ref}",
            entity_type="PAYMENT",
            entity_id=str(payment.id),
        )
        db.add(audit)
        await db.flush()
        await db.refresh(payment)
        return payment
