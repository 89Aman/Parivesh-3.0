import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from sqlalchemy import Uuid as UUID
from app.core.db import Base


class ComplianceTask(Base):
    __tablename__ = "compliance_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    task_name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    status = Column(String, nullable=False, default="PENDING")  # PENDING, SUBMITTED, OVERDUE
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    application = relationship("Application", foreign_keys=[application_id])
