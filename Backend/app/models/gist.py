from sqlalchemy import (
    Column, String, Boolean, DateTime, func, ForeignKey, Integer, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy import Uuid as UUID

from app.core.db import Base


class GistTemplate(Base):
    __tablename__ = "gist_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)   # 'A', 'B1', 'B2'
    sector_id = Column(Integer, ForeignKey("sectors.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)       # template with {{placeholders}}
    version = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, nullable=False, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    sector = relationship("Sector")
    creator = relationship("User", foreign_keys=[created_by])
