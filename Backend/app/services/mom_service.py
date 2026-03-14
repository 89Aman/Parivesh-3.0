import hashlib
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.mom import MoM
from app.models.mom_model import Gist
from app.models.application import Application, ApplicationStatus
from app.models.audit import AuditLog
from app.core.workflow import transition_status
from app.core.exceptions import NotFoundException, BadRequestException
from app.services.gist_service import GistService


class MoMService:

    @staticmethod
    async def create_or_update_mom(
        db: AsyncSession,
        app_id: UUID,
        content: str,
        actor_id: UUID,
    ) -> MoM:
        # Check that gist exists
        gist_result = await db.execute(select(Gist).filter(Gist.application_id == app_id))
        gist = gist_result.scalars().first()
        if not gist:
            gist = await GistService.generate_gist(db, app_id, actor_id, actor_role="MOM")

        # Check if MoM exists
        mom_result = await db.execute(select(MoM).filter(MoM.application_id == app_id))
        mom = mom_result.scalars().first()

        if mom:
            if mom.status == "FINALIZED":
                raise BadRequestException("MoM is already finalized and cannot be edited")
            mom.content = content
            mom.integrity_hash = hashlib.sha256(content.encode()).hexdigest()
            db.add(mom)
        else:
            mom = MoM(
                application_id=app_id,
                gist_id=gist.id,
                content=content,
                status="DRAFT",
                integrity_hash=hashlib.sha256(content.encode()).hexdigest(),
                created_by=actor_id,
            )
            db.add(mom)

        await db.flush()
        await db.refresh(mom)
        return mom

    @staticmethod
    async def get_for_application(db: AsyncSession, app_id: UUID) -> MoM | None:
        result = await db.execute(select(MoM).filter(MoM.application_id == app_id))
        return result.scalars().first()

    @staticmethod
    async def finalize_mom(db: AsyncSession, app_id: UUID, actor_id: UUID) -> MoM:
        result = await db.execute(select(MoM).filter(MoM.application_id == app_id))
        mom = result.scalars().first()
        if not mom:
            raise NotFoundException("MoM")
        if mom.status == "FINALIZED":
            raise BadRequestException("MoM is already finalized")

        # FSM: MOM_GENERATED → FINALIZED
        app_result = await db.execute(select(Application).filter(Application.id == app_id))
        app = app_result.scalars().first()
        await transition_status(db, app, ApplicationStatus.FINALIZED, str(actor_id), "MOM", "MoM finalized")

        # Create compliance tasks
        from app.services.compliance import ComplianceService
        await ComplianceService.generate_tasks(db, app.id)

        mom.status = "FINALIZED"
        mom.finalized_by = actor_id
        mom.finalized_at = datetime.now(timezone.utc)
        mom.integrity_hash = hashlib.sha256(mom.content.encode()).hexdigest()
        # In a real scenario, generate DOCX/PDF here
        mom.mom_docx_path = f"/generated/mom_{app_id}.docx"
        mom.mom_pdf_path = f"/generated/mom_{app_id}.pdf"
        mom.gist_docx_path = f"/generated/gist_{app_id}.docx"
        mom.gist_pdf_path = f"/generated/gist_{app_id}.pdf"
        db.add(mom)

        audit = AuditLog(
            actor_id=actor_id,
            actor_role="MOM",
            action="MOM_FINALIZED",
            description=f"MoM finalized for application {app_id}",
            entity_type="MOM",
            entity_id=str(mom.id),
        )
        db.add(audit)

        await db.flush()
        await db.refresh(mom)
        return mom
