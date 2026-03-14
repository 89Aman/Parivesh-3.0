from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.eds import EDSRequest, EDSIssue
from app.models.application import Application, ApplicationStatus
from app.models.audit import AuditLog
from app.core.workflow import transition_status
from app.core.exceptions import NotFoundException, BadRequestException


class EDSService:

    @staticmethod
    async def raise_eds(
        db: AsyncSession,
        app_id: UUID,
        actor_id: UUID,
        general_comments: str | None,
        issues: list[dict],
    ) -> EDSRequest:
        # Get application
        result = await db.execute(select(Application).filter(Application.id == app_id))
        app = result.scalars().first()
        if not app:
            raise NotFoundException("Application")

        # FSM transition: UNDER_SCRUTINY → EDS
        await transition_status(db, app, ApplicationStatus.EDS, str(actor_id), "SCRUTINY", "EDS raised")

        # Increment cycle
        app.eds_cycle_count += 1
        db.add(app)

        # Create EDS request
        eds = EDSRequest(
            application_id=app_id,
            cycle_number=app.eds_cycle_count,
            raised_by=actor_id,
            general_comments=general_comments,
        )
        db.add(eds)
        await db.flush()

        # Create issues
        for issue_data in issues:
            issue = EDSIssue(
                eds_request_id=eds.id,
                standard_reason=issue_data["standard_reason"],
                affected_field=issue_data.get("affected_field"),
                comments=issue_data.get("comments"),
            )
            db.add(issue)

        # Audit
        audit = AuditLog(
            actor_id=actor_id,
            actor_role="SCRUTINY",
            action="EDS_RAISED",
            description=f"EDS cycle {app.eds_cycle_count} raised with {len(issues)} issues",
            entity_type="APPLICATION",
            entity_id=str(app_id),
        )
        db.add(audit)

        await db.flush()
        return await EDSService.get_current_eds(db, app_id)

    @staticmethod
    async def get_current_eds(db: AsyncSession, app_id: UUID) -> EDSRequest | None:
        result = await db.execute(
            select(EDSRequest)
            .options(selectinload(EDSRequest.issues))
            .filter(EDSRequest.application_id == app_id)
            .order_by(EDSRequest.cycle_number.desc())
        )
        return result.scalars().first()

    @staticmethod
    async def resolve_eds(
        db: AsyncSession,
        app_id: UUID,
        actor_id: UUID,
        resolution_text: str | None = None,
    ) -> EDSRequest:
        eds = await EDSService.get_current_eds(db, app_id)
        if not eds:
            raise NotFoundException("EDS Request")
        if eds.resolved_at:
            raise BadRequestException("EDS already resolved")

        # Mark all issues resolved
        for issue in eds.issues:
            issue.is_resolved = True
            issue.resolution_text = resolution_text or "Resolved by PP"
            db.add(issue)

        eds.resolved_at = datetime.now(timezone.utc)
        db.add(eds)

        # FSM: EDS → UNDER_SCRUTINY
        result = await db.execute(select(Application).filter(Application.id == app_id))
        app = result.scalars().first()
        await transition_status(db, app, ApplicationStatus.UNDER_SCRUTINY, str(actor_id), "PP", "EDS resolved")

        await db.flush()
        return eds
