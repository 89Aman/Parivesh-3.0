from sqlalchemy import (
    Column, String, DateTime, Date, Time, func, ForeignKey, Integer, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy import Uuid as UUID

from app.core.db import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    meeting_date = Column(Date, nullable=False)
    meeting_time = Column(Time, nullable=True)
    meeting_type = Column(String, nullable=True)
    committee_name = Column(String, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    applications = relationship("MeetingApplication", back_populates="meeting", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])


class MeetingApplication(Base):
    __tablename__ = "meeting_applications"

    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), primary_key=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), primary_key=True)
    referral_notes = Column(Text, nullable=True)
    referred_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    referred_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    meeting = relationship("Meeting", back_populates="applications")
    application = relationship("Application")
    referrer = relationship("User", foreign_keys=[referred_by])
