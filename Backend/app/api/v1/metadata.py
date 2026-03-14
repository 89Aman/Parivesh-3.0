from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.schemas.sector import SectorOut
from app.services.template_service import TemplateService

router = APIRouter(prefix="/metadata", tags=["Metadata / Public"])


@router.get("/sectors", response_model=list[SectorOut])
async def list_sectors(db: AsyncSession = Depends(get_db)):
    """
    List all available sectors. Publicly accessible.
    """
    return await TemplateService.list_sectors(db)
