from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog


class AuditService:

    @staticmethod
    async def log_action(
        db: AsyncSession,
        actor_id: UUID | None,
        actor_role: str | None,
        action: str,
        description: str,
        entity_type: str,
        entity_id: str,
        ip_address: str | None = None,
    ) -> AuditLog:
        entry = AuditLog(
            actor_id=actor_id,
            actor_role=actor_role,
            action=action,
            description=description,
            entity_type=entity_type,
            entity_id=entity_id,
            ip_address=ip_address,
        )
        db.add(entry)
        await db.flush()
        return entry
