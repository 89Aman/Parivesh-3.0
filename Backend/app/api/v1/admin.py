from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import csv
import io
from datetime import datetime, timezone

from app.core.db import get_db
from app.core.rbac import require_role
from app.models.user import User
from app.schemas.user import UserOut, UserCreate, AdminUserUpdate, AssignRoleRequest
from app.schemas.sector import SectorCreate, SectorOut, SectorParameterCreate, SectorParameterUpdate, SectorParameterOut
from app.schemas.gist import GistTemplateCreate, GistTemplateUpdate, GistTemplateOut
from app.schemas.application import ApplicationOut
from app.services.user_service import UserService
from app.services.template_service import TemplateService
from app.services.application_service import ApplicationService
from app.models.application import Application

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/applications", response_model=list[ApplicationOut])
async def list_all_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    return await ApplicationService.list_all(db)


# ──────────────────────────────────────────
# Users & Roles
# ──────────────────────────────────────────


@router.get("/users", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    return await UserService.list_users(db)


@router.post("/users", response_model=UserOut)
async def create_user(
    data: UserCreate,
    role_name: Optional[str] = Query("PP", description="Role to assign: ADMIN, PP, RQP, SCRUTINY, MOM"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    """Admin-only endpoint to create a new user with any role."""
    user = await UserService.create_pp_user(
        db,
        email=data.email,
        password=data.password,
        full_name=data.full_name,
        organization=data.organization,
        phone=data.phone,
    )
    await db.flush()

    # Enforce exactly one role per user to avoid duplicate portal access.
    if role_name:
        user = await UserService.set_single_role(db, user.id, role_name, actor_id=current_user.id)

    await db.commit()
    return user


@router.post("/users/{user_id}/roles", response_model=UserOut)
async def assign_role(
    user_id: str,
    data: AssignRoleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    user = await UserService.set_single_role(db, user_id, data.role_name, actor_id=current_user.id)
    await db.commit()
    return user


@router.put("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    data: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    user = await UserService.update_user(
        db,
        user_id,
        full_name=data.full_name,
        organization=data.organization,
        phone=data.phone,
        role_name=data.role_name,
        actor_id=current_user.id,
    )
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


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    """Admin-only endpoint to delete a user."""
    await UserService.delete_user(db, user_id, actor_id=current_user.id)
    await db.commit()
    return None


# ──────────────────────────────────────────
# CSV Export
# ──────────────────────────────────────────


@router.get("/export")
async def export_applications_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    """Download all applications as a CSV file."""
    result = await db.execute(
        select(Application).order_by(Application.created_at.desc())
    )
    apps = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "App ID", "Project Name", "Category", "Sector ID",
        "State", "District", "Status", "Risk Score", "Risk Level",
        "Submitted", "Applicant ID"
    ])
    for app in apps:
        writer.writerow([
            str(app.id),
            app.project_name,
            app.category,
            app.sector_id,
            app.state or "",
            app.district or "",
            app.status,
            app.risk_score,
            app.risk_level,
            app.created_at.strftime("%Y-%m-%d") if app.created_at else "",
            str(app.applicant_id),
        ])

    today = datetime.now(timezone.utc).strftime("%d%b%Y")
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=parivesh_applications_{today}.csv"},
    )


# ──────────────────────────────────────────
# Geo Endpoint
# ──────────────────────────────────────────


@router.get("/applications/geo")
async def applications_geo(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    """Returns applications with lat/long for GIS map view."""
    result = await db.execute(
        select(
            Application.id,
            Application.project_name,
            Application.status,
            Application.category,
            Application.sector_id,
            Application.state,
            Application.district,
            Application.latitude,
            Application.longitude,
        ).filter(
            Application.latitude.isnot(None),
            Application.longitude.isnot(None),
        )
    )
    rows = result.all()
    return [
        {
            "id": str(row.id),
            "project_name": row.project_name,
            "status": row.status,
            "category": row.category,
            "sector_id": row.sector_id,
            "state": row.state,
            "district": row.district,
            "lat": float(row.latitude),
            "lng": float(row.longitude),
        }
        for row in rows
    ]
