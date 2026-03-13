from sqlalchemy import (
    Column, String, DateTime, func, ForeignKey, Integer, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.db import Base


class MoM(Base):
    __tablename__ = "moms"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    gist_id = Column(Integer, ForeignKey("gists.id", ondelete="RESTRICT"), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="DRAFT")  # DRAFT / FINALIZED
    integrity_hash = Column(String, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    finalized_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    finalized_at = Column(DateTime(timezone=True), nullable=True)
    mom_docx_path = Column(String, nullable=True)
    mom_pdf_path = Column(String, nullable=True)
    gist_docx_path = Column(String, nullable=True)
    gist_pdf_path = Column(String, nullable=True)

    application = relationship("Application")
    gist = relationship("Gist")
    creator = relationship("User", foreign_keys=[created_by])
    finalizer = relationship("User", foreign_keys=[finalized_by])
