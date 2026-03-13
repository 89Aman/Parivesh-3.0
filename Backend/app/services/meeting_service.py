from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.meeting import Meeting, MeetingApplication
from app.models.application import Application, ApplicationStatus
from app.models.payment import Payment, PaymentStatus
from app.models.audit import AuditLog
from app.core.workflow import transition_status
from app.core.exceptions import NotFoundException, BadRequestException


class MeetingService:

    @staticmethod
    async def create_meeting(db: AsyncSession, data: dict, created_by: UUID) -> Meeting:
        meeting = Meeting(
            meeting_date=data["meeting_date"],
            meeting_time=data.get("meeting_time"),
            meeting_type=data.get("meeting_type"),
            committee_name=data.get("committee_name"),
            created_by=created_by,
        )
        db.add(meeting)
        await db.flush()
        await db.refresh(meeting)
        return meeting

    @staticmethod
    async def list_meetings(db: AsyncSession) -> list[Meeting]:
        result = await db.execute(select(Meeting).order_by(Meeting.meeting_date.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def refer_application(
        db: AsyncSession,
        app_id: UUID,
        meeting_id: int,
        actor_id: UUID,
        referral_notes: str | None = None,
    ) -> MeetingApplication:
        # Validate application
        result = await db.execute(select(Application).filter(Application.id == app_id))
        app = result.scalars().first()
        if not app:
            raise NotFoundException("Application")

        # Check payment is verified
        pay_result = await db.execute(select(Payment).filter(Payment.application_id == app_id))
        payment = pay_result.scalars().first()
        if not payment or payment.status != PaymentStatus.VERIFIED:
            raise BadRequestException("Payment must be verified before referral")

        # Validate meeting exists
        meet_result = await db.execute(select(Meeting).filter(Meeting.id == meeting_id))
        meeting = meet_result.scalars().first()
        if not meeting:
            raise NotFoundException("Meeting")

        # FSM: UNDER_SCRUTINY → REFERRED
        await transition_status(db, app, ApplicationStatus.REFERRED, str(actor_id), "SCRUTINY", "Referred to meeting")

        # Create referral
        referral = MeetingApplication(
            meeting_id=meeting_id,
            application_id=app_id,
            referral_notes=referral_notes,
            referred_by=actor_id,
        )
        db.add(referral)

        audit = AuditLog(
            actor_id=actor_id,
            actor_role="SCRUTINY",
            action="APPLICATION_REFERRED",
            description=f"Application referred to meeting {meeting_id}",
            entity_type="APPLICATION",
            entity_id=str(app_id),
        )
        db.add(audit)

        await db.flush()
        await db.refresh(referral)
        return referral
