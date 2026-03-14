"""
Compliance Router — post-clearance compliance tasks for PPs and Admins.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, datetime
from typing import Optional

from app.core.db import get_db
from app.core.rbac import require_role
from app.models.user import User
from app.services.compliance import ComplianceService

router = APIRouter(prefix="/compliance", tags=["Compliance"])


class ComplianceTaskOut(BaseModel):
    id: UUID
    application_id: UUID
    task_name: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: str
    submitted_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/{app_id}", response_model=list[ComplianceTaskOut])
async def get_compliance_tasks(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "PP", "RQP")),
):
    return await ComplianceService.list_for_application(db, app_id)


@router.get("/admin/all", response_model=list[ComplianceTaskOut])
async def get_all_compliance_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    return await ComplianceService.list_all(db)


@router.patch("/{task_id}/submit", response_model=ComplianceTaskOut)
async def submit_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP", "ADMIN")),
):
    task = await ComplianceService.submit_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Compliance task not found")
    await db.commit()
    return task
