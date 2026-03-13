from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


# ---------- Gist Template (Admin) ----------

class GistTemplateCreate(BaseModel):
    name: str
    category: str  # A, B1, B2
    sector_id: int
    content: str  # template body with {{placeholders}}


class GistTemplateUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    is_active: Optional[bool] = None


class GistTemplateOut(BaseModel):
    id: int
    name: str
    category: str
    sector_id: int
    content: str
    version: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Generated Gist ----------

class GistOut(BaseModel):
    id: int
    application_id: UUID
    template_id: Optional[int] = None
    content: str
    generated_by: UUID
    generated_at: datetime
    last_modified_by: Optional[UUID] = None
    last_modified_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GistUpdateRequest(BaseModel):
    content: str
