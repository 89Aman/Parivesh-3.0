from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.rbac import require_role
from app.models.user import User
from app.models.application import ApplicationStatus
from app.schemas.application import ApplicationOut
from app.schemas.gist import GistOut, GistUpdateRequest
from app.schemas.mom import MoMCreate, MoMUpdate, MoMOut
from app.services.application_service import ApplicationService
from app.services.gist_service import GistService
from app.services.mom_service import MoMService
from app.services.meeting_service import MeetingService
from app.services.naas_service import NaaSService
from app.schemas.meeting import MeetingOut

router = APIRouter(prefix="/mom", tags=["MoM"])


# ──── Dashboard ────


@router.get("/applications", response_model=list[ApplicationOut])
async def list_applications(
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("MOM")),
):
    if status:
        statuses = [ApplicationStatus(s.strip()) for s in status.split("|")]
    else:
        statuses = [
            ApplicationStatus.REFERRED,
            ApplicationStatus.MOM_GENERATED,
            ApplicationStatus.FINALIZED,
        ]
    return await ApplicationService.list_by_statuses(db, statuses)


@router.get("/meetings", response_model=list[MeetingOut])
async def list_meetings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("MOM")),
):
    return await MeetingService.list_meetings(db)


@router.post("/applications/{app_id}/gist/generate", response_model=GistOut)
async def generate_gist_for_mom(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("MOM")),
):
    gist = await GistService.generate_gist(db, app_id, current_user.id, actor_role="MOM")
    await db.commit()
    return gist


@router.get("/applications/{app_id}/gist", response_model=GistOut)
async def get_gist_for_application(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("MOM")),
):
    gist = await GistService.get_for_application(db, app_id)
    if not gist:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Gist")
    return gist


# ──── Gist (view / edit) ────


@router.get("/gists/{gist_id}", response_model=GistOut)
async def get_gist(
    gist_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("MOM")),
):
    from sqlalchemy.future import select
    from app.models.mom_model import Gist
    result = await db.execute(select(Gist).filter(Gist.id == gist_id))
    gist = result.scalars().first()
    if not gist:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Gist")
    return gist


@router.put("/gists/{gist_id}", response_model=GistOut)
async def update_gist(
    gist_id: int,
    data: GistUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("MOM")),
):
    gist = await GistService.update_gist(db, gist_id, data.content, current_user.id)
    await db.commit()
    return gist


# ──── MoM CRUD ────


@router.post("/applications/{app_id}/mom", response_model=MoMOut)
async def create_or_update_mom(
    app_id: UUID,
    data: MoMCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("MOM")),
):
    mom = await MoMService.create_or_update_mom(db, app_id, data.content, current_user.id)
    await db.commit()
    return mom


@router.post("/applications/{app_id}/mom/finalize", response_model=MoMOut)
async def finalize_mom(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("MOM")),
):
    mom = await MoMService.finalize_mom(db, app_id, current_user.id)
    await db.commit()
    await NaaSService.emit_event(
        "MOM_FINALIZED",
        {
            "application_id": str(app_id),
            "mom_id": mom.id,
            "actor_id": str(current_user.id),
            "actor_role": "MOM",
        },
    )
    return mom


@router.get("/applications/{app_id}/mom", response_model=MoMOut)
async def get_mom(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("MOM")),
):
    mom = await MoMService.get_for_application(db, app_id)
    if not mom:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("MoM")
    return mom
