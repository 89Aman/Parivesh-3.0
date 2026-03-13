import enum
import uuid
from sqlalchemy import (
    Column, String, Boolean, DateTime, func, Enum, ForeignKey,
    Integer, Numeric, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.db import Base


class ApplicationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_SCRUTINY = "UNDER_SCRUTINY"
    EDS = "EDS"
    REFERRED = "REFERRED"
    MOM_GENERATED = "MOM_GENERATED"
    FINALIZED = "FINALIZED"


class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    applicant_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    project_name = Column(String, nullable=False)
    project_description = Column(Text, nullable=True)
    category = Column(String, nullable=False)  # 'A', 'B1', 'B2'
    sector_id = Column(Integer, ForeignKey("sectors.id", ondelete="RESTRICT"), nullable=False)

    # Location
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    taluk = Column(String, nullable=True)
    village = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    project_area_ha = Column(Numeric(14, 4), nullable=True)
    capacity = Column(String, nullable=True)

    status = Column(
        Enum(ApplicationStatus),
        nullable=False,
        default=ApplicationStatus.DRAFT,
    )
    eds_cycle_count = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    applicant = relationship("User", foreign_keys=[applicant_id])
    sector = relationship("Sector")
    parameters = relationship("ApplicationParameter", back_populates="application", cascade="all, delete-orphan")
    documents = relationship("ApplicationDocument", back_populates="application", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="application", uselist=False)
    status_history = relationship("ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan")


class ApplicationParameter(Base):
    __tablename__ = "application_parameters"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    sector_parameter_id = Column(Integer, ForeignKey("sector_parameters.id", ondelete="CASCADE"), nullable=False)
    value_text = Column(Text, nullable=True)
    value_number = Column(Numeric, nullable=True)
    value_boolean = Column(Boolean, nullable=True)

    application = relationship("Application", back_populates="parameters")
    sector_parameter = relationship("SectorParameter")


class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    from_status = Column(String, nullable=True)
    to_status = Column(String, nullable=False)
    changed_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    changed_by_role = Column(String, nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    application = relationship("Application", back_populates="status_history")
