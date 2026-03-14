"""
Notifications Router — in-app notification bell.
"""
from uuid import UUID
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.core.db import get_db
from app.core.rbac import require_role
from app.models.user import User
from app.services.notifications import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationOut(BaseModel):
    id: UUID
    message: str
    application_id: UUID | None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/me", response_model=list[NotificationOut])
async def get_my_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "SCRUTINY", "MOM", "PP", "RQP")),
):
    return await NotificationService.list_for_user(db, current_user.id)


@router.get("/me/unread-count")
async def unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "SCRUTINY", "MOM", "PP", "RQP")),
):
    count = await NotificationService.unread_count(db, current_user.id)
    return {"unread": count}


@router.patch("/{notification_id}/read", response_model=NotificationOut)
async def mark_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "SCRUTINY", "MOM", "PP", "RQP")),
):
    notif = await NotificationService.mark_read(db, notification_id, current_user.id)
    await db.commit()
    return notif


@router.post("/me/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "SCRUTINY", "MOM", "PP", "RQP")),
):
    count = await NotificationService.mark_all_read(db, current_user.id)
    await db.commit()
    return {"marked_read": count}
