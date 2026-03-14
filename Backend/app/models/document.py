import uuid
from sqlalchemy import Column, String, Boolean, DateTime, func, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy import Uuid as UUID

from app.core.db import Base


class ApplicationDocument(Base):
    __tablename__ = "application_documents"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    mime_type = Column(String, nullable=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_verified = Column(Boolean, nullable=False, default=False)

    application = relationship("Application", back_populates="documents")
    uploader = relationship("User", foreign_keys=[uploaded_by])
