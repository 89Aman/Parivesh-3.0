from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class MoMCreate(BaseModel):
    content: str


class MoMUpdate(BaseModel):
    content: Optional[str] = None


class MoMOut(BaseModel):
    id: int
    application_id: UUID
    gist_id: int
    content: str
    status: str
    integrity_hash: Optional[str] = None
    created_by: UUID
    created_at: datetime
    finalized_by: Optional[UUID] = None
    finalized_at: Optional[datetime] = None
    mom_docx_path: Optional[str] = None
    mom_pdf_path: Optional[str] = None
    gist_docx_path: Optional[str] = None
    gist_pdf_path: Optional[str] = None

    class Config:
        from_attributes = True
