from sqlalchemy import (
    Column, String, Boolean, DateTime, func, ForeignKey, Integer, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.db import Base


class EDSRequest(Base):
    __tablename__ = "eds_requests"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    cycle_number = Column(Integer, nullable=False)
    raised_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    raised_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    general_comments = Column(Text, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    issues = relationship("EDSIssue", back_populates="eds_request", cascade="all, delete-orphan")
    application = relationship("Application")
    raiser = relationship("User", foreign_keys=[raised_by])


class EDSIssue(Base):
    __tablename__ = "eds_issues"

    id = Column(Integer, primary_key=True, index=True)
    eds_request_id = Column(Integer, ForeignKey("eds_requests.id", ondelete="CASCADE"), nullable=False)
    standard_reason = Column(String, nullable=False)
    affected_field = Column(String, nullable=True)
    comments = Column(Text, nullable=True)
    resolution_text = Column(Text, nullable=True)
    is_resolved = Column(Boolean, nullable=False, default=False)

    eds_request = relationship("EDSRequest", back_populates="issues")
