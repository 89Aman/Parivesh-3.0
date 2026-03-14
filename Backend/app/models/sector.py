import enum
from sqlalchemy import Column, String, Boolean, DateTime, func, Enum, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.db import Base

class ParameterTypeEnum(str, enum.Enum):
    TEXT = "TEXT"
    NUMBER = "NUMBER"
    BOOLEAN = "BOOLEAN"

class Sector(Base):
    __tablename__ = "sectors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    parameters = relationship("SectorParameter", back_populates="sector", cascade="all, delete-orphan")

class SectorParameter(Base):
    __tablename__ = "sector_parameters"
    id = Column(Integer, primary_key=True, index=True)
    sector_id = Column(Integer, ForeignKey("sectors.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    key = Column(String, nullable=False)
    type = Column(
        Enum(
            ParameterTypeEnum,
            name="parameter_type",
            create_type=False,
        ),
        nullable=False,
    )
    is_required = Column(Boolean, default=False, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)

    sector = relationship("Sector", back_populates="parameters")
