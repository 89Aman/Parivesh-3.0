from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.sector import Sector, SectorParameter
from app.models.gist import GistTemplate
from app.core.exceptions import NotFoundException


class TemplateService:

    # ---- Sectors ----

    @staticmethod
    async def create_sector(db: AsyncSession, name: str, description: str | None = None) -> Sector:
        sector = Sector(name=name, description=description)
        db.add(sector)
        await db.flush()
        await db.refresh(sector)
        return sector

    @staticmethod
    async def list_sectors(db: AsyncSession) -> list[Sector]:
        result = await db.execute(select(Sector).order_by(Sector.name))
        return list(result.scalars().all())

    @staticmethod
    async def get_sector(db: AsyncSession, sector_id: int) -> Sector:
        result = await db.execute(select(Sector).filter(Sector.id == sector_id))
        sector = result.scalars().first()
        if not sector:
            raise NotFoundException("Sector")
        return sector

    # ---- Sector Parameters ----

    @staticmethod
    async def add_parameter(db: AsyncSession, sector_id: int, data: dict) -> SectorParameter:
        param = SectorParameter(
            sector_id=sector_id,
            name=data["name"],
            key=data["key"],
            type=data["type"],
            is_required=data.get("is_required", False),
            display_order=data.get("display_order", 0),
        )
        db.add(param)
        await db.flush()
        await db.refresh(param)
        return param

    @staticmethod
    async def list_parameters(db: AsyncSession, sector_id: int) -> list[SectorParameter]:
        result = await db.execute(
            select(SectorParameter)
            .filter(SectorParameter.sector_id == sector_id)
            .order_by(SectorParameter.display_order)
        )
        return list(result.scalars().all())

    @staticmethod
    async def update_parameter(db: AsyncSession, param_id: int, data: dict) -> SectorParameter:
        result = await db.execute(
            select(SectorParameter).filter(SectorParameter.id == param_id)
        )
        param = result.scalars().first()
        if not param:
            raise NotFoundException("Sector Parameter")
        for key, value in data.items():
            if value is not None and hasattr(param, key):
                setattr(param, key, value)
        db.add(param)
        await db.flush()
        await db.refresh(param)
        return param

    # ---- Gist Templates ----

    @staticmethod
    async def create_gist_template(db: AsyncSession, data: dict, created_by=None) -> GistTemplate:
        template = GistTemplate(
            name=data["name"],
            category=data["category"],
            sector_id=data["sector_id"],
            content=data["content"],
            created_by=created_by,
        )
        db.add(template)
        await db.flush()
        await db.refresh(template)
        return template

    @staticmethod
    async def list_gist_templates(db: AsyncSession, category: str | None = None,
                                   sector_id: int | None = None) -> list[GistTemplate]:
        query = select(GistTemplate).filter(GistTemplate.is_active == True)
        if category:
            query = query.filter(GistTemplate.category == category)
        if sector_id:
            query = query.filter(GistTemplate.sector_id == sector_id)
        result = await db.execute(query.order_by(GistTemplate.created_at.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_gist_template(db: AsyncSession, template_id: int) -> GistTemplate:
        result = await db.execute(
            select(GistTemplate).filter(GistTemplate.id == template_id)
        )
        template = result.scalars().first()
        if not template:
            raise NotFoundException("Gist Template")
        return template

    @staticmethod
    async def update_gist_template(db: AsyncSession, template_id: int, data: dict) -> GistTemplate:
        template = await TemplateService.get_gist_template(db, template_id)
        for key, value in data.items():
            if value is not None and hasattr(template, key):
                setattr(template, key, value)
        db.add(template)
        await db.flush()
        await db.refresh(template)
        return template
