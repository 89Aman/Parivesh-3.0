from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.application import Application, ApplicationStatus, ApplicationParameter
from app.models.sector import SectorParameter
from app.core.workflow import transition_status
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException


class ApplicationService:

    @staticmethod
    async def create(db: AsyncSession, data: dict, applicant_id: UUID) -> Application:
        app = Application(
            applicant_id=applicant_id,
            project_name=data["project_name"],
            project_description=data.get("project_description"),
            category=data["category"],
            sector_id=data["sector_id"],
            state=data.get("state"),
            district=data.get("district"),
            taluk=data.get("taluk"),
            village=data.get("village"),
            pincode=data.get("pincode"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            project_area_ha=data.get("project_area_ha"),
            capacity=data.get("capacity"),
            status=ApplicationStatus.DRAFT,
        )
        db.add(app)
        await db.flush()
        await db.refresh(app)
        return app

    @staticmethod
    async def get_by_id(db: AsyncSession, app_id: UUID) -> Application:
        result = await db.execute(
            select(Application)
            .options(
                selectinload(Application.parameters),
                selectinload(Application.documents),
                selectinload(Application.payment),
                selectinload(Application.status_history),
            )
            .filter(Application.id == app_id)
        )
        app = result.scalars().first()
        if not app:
            raise NotFoundException("Application")
        return app

    @staticmethod
    async def list_by_owner(db: AsyncSession, owner_id: UUID) -> list[Application]:
        result = await db.execute(
            select(Application).filter(Application.applicant_id == owner_id)
            .order_by(Application.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def list_by_statuses(db: AsyncSession, statuses: list[ApplicationStatus]) -> list[Application]:
        result = await db.execute(
            select(Application).filter(Application.status.in_(statuses))
            .order_by(Application.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def update(db: AsyncSession, app_id: UUID, data: dict, actor_id: UUID) -> Application:
        app = await ApplicationService.get_by_id(db, app_id)
        if app.applicant_id != actor_id:
            raise ForbiddenException("Not the owner of this application")
        if app.status not in (ApplicationStatus.DRAFT, ApplicationStatus.EDS):
            raise BadRequestException("Application can only be edited in DRAFT or EDS status")

        for key, value in data.items():
            if value is not None and hasattr(app, key):
                setattr(app, key, value)
        db.add(app)
        await db.flush()
        await db.refresh(app)
        return app

    @staticmethod
    async def submit(db: AsyncSession, app_id: UUID, actor_id: UUID, actor_role: str) -> Application:
        app = await ApplicationService.get_by_id(db, app_id)
        if app.applicant_id != actor_id:
            raise ForbiddenException("Not the owner of this application")
        return await transition_status(db, app, ApplicationStatus.SUBMITTED, str(actor_id), actor_role)

    @staticmethod
    async def set_parameters(db: AsyncSession, app_id: UUID, params: list[dict]) -> list[ApplicationParameter]:
        # Delete existing
        result = await db.execute(
            select(ApplicationParameter).filter(ApplicationParameter.application_id == app_id)
        )
        for old in result.scalars().all():
            await db.delete(old)

        new_params = []
        for p in params:
            ap = ApplicationParameter(
                application_id=app_id,
                sector_parameter_id=p["sector_parameter_id"],
                value_text=p.get("value_text"),
                value_number=p.get("value_number"),
                value_boolean=p.get("value_boolean"),
            )
            db.add(ap)
            new_params.append(ap)
        await db.flush()
        return new_params
