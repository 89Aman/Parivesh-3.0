"""
Notification Service — creates in-app notifications for users.
"""
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.notification import Notification


class NotificationService:

    @staticmethod
    async def create(
        db: AsyncSession,
        user_id: UUID,
        message: str,
        application_id: UUID | None = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            message=message,
            application_id=application_id,
        )
        db.add(notification)
        await db.flush()
        return notification

    @staticmethod
    async def list_for_user(db: AsyncSession, user_id: UUID) -> list[Notification]:
        result = await db.execute(
            select(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(50)
        )
        return list(result.scalars().all())

    @staticmethod
    async def mark_read(db: AsyncSession, notification_id: UUID, user_id: UUID) -> Notification | None:
        result = await db.execute(
            select(Notification).filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
        )
        notif = result.scalars().first()
        if notif:
            notif.is_read = True
            db.add(notif)
            await db.flush()
        return notif

    @staticmethod
    async def mark_all_read(db: AsyncSession, user_id: UUID) -> int:
        result = await db.execute(
            select(Notification).filter(
                Notification.user_id == user_id,
                Notification.is_read == False,  # noqa: E712
            )
        )
        notifications = result.scalars().all()
        for n in notifications:
            n.is_read = True
            db.add(n)
        await db.flush()
        return len(notifications)

    @staticmethod
    async def unread_count(db: AsyncSession, user_id: UUID) -> int:
        result = await db.execute(
            select(Notification).filter(
                Notification.user_id == user_id,
                Notification.is_read == False,  # noqa: E712
            )
        )
        return len(result.scalars().all())
