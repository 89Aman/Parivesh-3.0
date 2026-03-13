from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class DocumentOut(BaseModel):
    id: int
    application_id: UUID
    name: str
    file_path: str
    mime_type: Optional[str] = None
    uploaded_by: UUID
    uploaded_at: datetime

    class Config:
        from_attributes = True
