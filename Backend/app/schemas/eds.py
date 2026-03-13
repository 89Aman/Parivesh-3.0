from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class EDSIssueCreate(BaseModel):
    standard_reason: str
    affected_field: Optional[str] = None
    comments: Optional[str] = None


class EDSRequestCreate(BaseModel):
    general_comments: Optional[str] = None
    issues: list[EDSIssueCreate]


class EDSIssueOut(BaseModel):
    id: int
    standard_reason: str
    affected_field: Optional[str] = None
    comments: Optional[str] = None
    resolution_text: Optional[str] = None
    is_resolved: bool

    class Config:
        from_attributes = True


class EDSRequestOut(BaseModel):
    id: int
    application_id: UUID
    cycle_number: int
    raised_by: UUID
    raised_at: datetime
    general_comments: Optional[str] = None
    resolved_at: Optional[datetime] = None
    issues: list[EDSIssueOut] = []

    class Config:
        from_attributes = True


class EDSResolveRequest(BaseModel):
    resolution_text: Optional[str] = None
