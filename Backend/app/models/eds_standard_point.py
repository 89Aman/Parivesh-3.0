"""
Master list of standardised EDS (Extra Data / Document Sought) points.

Each row represents one checklist item that a Scrutiny Officer may raise
against an application.  Rows are grouped by `category` so the UI can
render themed sections.
"""

from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, func

from app.core.db import Base


class EDSStandardPoint(Base):
    __tablename__ = "eds_standard_points"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    label = Column(Text, nullable=False)
    category = Column(String(60), nullable=False, index=True)
    display_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
