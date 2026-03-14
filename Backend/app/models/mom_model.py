from sqlalchemy import (
    Column, String, DateTime, func, ForeignKey, Integer, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy import Uuid as UUID

from app.core.db import Base


class Gist(Base):
    __tablename__ = "gists"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    template_id = Column(Integer, ForeignKey("gist_templates.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    generated_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_modified_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    last_modified_at = Column(DateTime(timezone=True), nullable=True)

    application = relationship("Application")
    template = relationship("GistTemplate")
    generator = relationship("User", foreign_keys=[generated_by])
