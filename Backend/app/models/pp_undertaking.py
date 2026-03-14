"""
Master list of standardised PP Undertaking / Condition points.

Each row represents one undertaking condition that a Project Proponent (PP)
must agree to when submitting an application.  Rows are grouped by
`mineral_type` (e.g. Stones, Earth clay/Bricks, Sand, Others) so the UI
can render the appropriate checklist for each project type.
"""

from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, func

from app.core.db import Base


class PPUndertaking(Base):
    __tablename__ = "pp_undertakings"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    label = Column(Text, nullable=False)
    mineral_type = Column(String(60), nullable=False, index=True)
    display_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
