from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, time, datetime


class MeetingCreate(BaseModel):
    meeting_date: date
    meeting_time: Optional[time] = None
    meeting_type: Optional[str] = None
    committee_name: Optional[str] = None


class MeetingOut(BaseModel):
    id: int
    meeting_date: date
    meeting_time: Optional[time] = None
    meeting_type: Optional[str] = None
    committee_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReferralRequest(BaseModel):
    meeting_id: int
    referral_notes: Optional[str] = None


class MeetingApplicationOut(BaseModel):
    meeting_id: int
    application_id: UUID
    referral_notes: Optional[str] = None
    referred_by: UUID
    referred_at: datetime

    class Config:
        from_attributes = True
