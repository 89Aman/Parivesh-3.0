import re
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.application import Application, ApplicationStatus, ApplicationParameter
from app.models.gist import GistTemplate
from app.models.mom_model import Gist
from app.models.audit import AuditLog
from app.core.workflow import transition_status
from app.core.exceptions import NotFoundException, BadRequestException


class GistService:

    @staticmethod
    async def generate_gist(
        db: AsyncSession,
        app_id: UUID,
        actor_id: UUID,
    ) -> Gist:
        """
        Auto-generate a Gist from the matching template + application data.
        FSM: REFERRED → MOM_GENERATED
        """
        # Load application with parameters
        result = await db.execute(
            select(Application)
            .options(selectinload(Application.parameters))
            .filter(Application.id == app_id)
        )
        app = result.scalars().first()
        if not app:
            raise NotFoundException("Application")

        # Find matching template
        templ_result = await db.execute(
            select(GistTemplate).filter(
                GistTemplate.category == app.category,
                GistTemplate.sector_id == app.sector_id,
                GistTemplate.is_active == True,
            ).order_by(GistTemplate.version.desc())
        )
        template = templ_result.scalars().first()
        if not template:
            raise BadRequestException(
                f"No active gist template found for category={app.category}, sector_id={app.sector_id}"
            )

        # Build placeholder map from application fields + parameters
        placeholders = {
            "project_name": app.project_name or "",
            "project_description": app.project_description or "",
            "category": app.category or "",
            "state": app.state or "",
            "district": app.district or "",
            "taluk": app.taluk or "",
            "village": app.village or "",
            "pincode": app.pincode or "",
            "latitude": str(app.latitude or ""),
            "longitude": str(app.longitude or ""),
            "project_area_ha": str(app.project_area_ha or ""),
            "capacity": app.capacity or "",
        }

        # Load sector parameter keys for dynamic values
        for ap in app.parameters:
            if ap.sector_parameter:
                key = ap.sector_parameter.key
                if ap.value_text is not None:
                    placeholders[key] = ap.value_text
                elif ap.value_number is not None:
                    placeholders[key] = str(ap.value_number)
                elif ap.value_boolean is not None:
                    placeholders[key] = "Yes" if ap.value_boolean else "No"

        # Replace {{placeholder}} in template
        content = template.content
        for key, value in placeholders.items():
            content = content.replace(f"{{{{{key}}}}}", value)

        # Replace any remaining unreplaced placeholders with empty
        content = re.sub(r"\{\{[^}]+\}\}", "", content)

        # FSM: REFERRED → MOM_GENERATED
        await transition_status(db, app, ApplicationStatus.MOM_GENERATED, str(actor_id), "SCRUTINY", "Gist generated")

        # Create gist record
        gist = Gist(
            application_id=app_id,
            template_id=template.id,
            content=content,
            generated_by=actor_id,
        )
        db.add(gist)

        audit = AuditLog(
            actor_id=actor_id,
            actor_role="SCRUTINY",
            action="GIST_GENERATED",
            description=f"Gist generated from template '{template.name}' for application {app_id}",
            entity_type="GIST",
            entity_id=str(app_id),
        )
        db.add(audit)

        await db.flush()
        await db.refresh(gist)
        return gist

    @staticmethod
    async def get_for_application(db: AsyncSession, app_id: UUID) -> Gist | None:
        result = await db.execute(
            select(Gist).filter(Gist.application_id == app_id)
        )
        return result.scalars().first()

    @staticmethod
    async def update_gist(db: AsyncSession, gist_id: int, content: str, actor_id: UUID) -> Gist:
        result = await db.execute(select(Gist).filter(Gist.id == gist_id))
        gist = result.scalars().first()
        if not gist:
            raise NotFoundException("Gist")
        from datetime import datetime, timezone
        gist.content = content
        gist.last_modified_by = actor_id
        gist.last_modified_at = datetime.now(timezone.utc)
        db.add(gist)
        await db.flush()
        await db.refresh(gist)
        return gist
