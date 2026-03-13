from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.rbac import require_role
from app.models.user import User
from app.schemas.user import UserOut, AssignRoleRequest
from app.schemas.sector import SectorCreate, SectorOut, SectorParameterCreate, SectorParameterUpdate, SectorParameterOut
from app.schemas.gist import GistTemplateCreate, GistTemplateUpdate, GistTemplateOut
from app.services.user_service import UserService
from app.services.template_service import TemplateService

router = APIRouter(prefix="/admin", tags=["Admin"])


# ──────────────────────────────────────────
# Users & Roles
# ──────────────────────────────────────────


@router.get("/users", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    return await UserService.list_users(db)


@router.post("/users/{user_id}/roles", response_model=UserOut)
async def assign_role(
    user_id: str,
    data: AssignRoleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    user = await UserService.assign_role(db, user_id, data.role_name, actor_id=current_user.id)
    await db.commit()
    return user


@router.delete("/users/{user_id}/roles/{role_name}", response_model=UserOut)
async def remove_role(
    user_id: str,
    role_name: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    user = await UserService.remove_role(db, user_id, role_name, actor_id=current_user.id)
    await db.commit()
    return user


# ──────────────────────────────────────────
# Sectors
# ──────────────────────────────────────────


@router.get("/sectors", response_model=list[SectorOut])
async def list_sectors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    return await TemplateService.list_sectors(db)


@router.post("/sectors", response_model=SectorOut)
async def create_sector(
    data: SectorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    sector = await TemplateService.create_sector(db, data.name, data.description)
    await db.commit()
    return sector


# ──────────────────────────────────────────
# Sector Parameters
# ──────────────────────────────────────────


@router.get("/sectors/{sector_id}/parameters", response_model=list[SectorParameterOut])
async def list_parameters(
    sector_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    return await TemplateService.list_parameters(db, sector_id)


@router.post("/sectors/{sector_id}/parameters", response_model=SectorParameterOut)
async def add_parameter(
    sector_id: int,
    data: SectorParameterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    param = await TemplateService.add_parameter(db, sector_id, data.model_dump())
    await db.commit()
    return param


@router.put("/sectors/{sector_id}/parameters/{param_id}", response_model=SectorParameterOut)
async def update_parameter(
    sector_id: int,
    param_id: int,
    data: SectorParameterUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    param = await TemplateService.update_parameter(db, param_id, data.model_dump(exclude_unset=True))
    await db.commit()
    return param


# ──────────────────────────────────────────
# Gist Templates
# ──────────────────────────────────────────


@router.get("/gist-templates", response_model=list[GistTemplateOut])
async def list_gist_templates(
    category: Optional[str] = Query(None),
    sector_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    return await TemplateService.list_gist_templates(db, category=category, sector_id=sector_id)


@router.post("/gist-templates", response_model=GistTemplateOut)
async def create_gist_template(
    data: GistTemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    template = await TemplateService.create_gist_template(
        db, data.model_dump(), created_by=current_user.id
    )
    await db.commit()
    return template


@router.put("/gist-templates/{template_id}", response_model=GistTemplateOut)
async def update_gist_template(
    template_id: int,
    data: GistTemplateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    template = await TemplateService.update_gist_template(
        db, template_id, data.model_dump(exclude_unset=True)
    )
    await db.commit()
    return template
