from sqlalchemy import Column, String, DateTime, func, ForeignKey, Integer, Text, Enum
from sqlalchemy import Uuid as UUID
from sqlalchemy.dialects.postgresql import INET
from sqlalchemy.orm import relationship

from app.core.db import Base
from app.models.user import UserRoleEnum


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actor_role = Column(
        Enum(
            UserRoleEnum,
            name="user_role",
            create_type=False,
        ),
        nullable=True,
    )
    action = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    ip_address = Column(INET, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    actor = relationship("User", foreign_keys=[actor_id])
