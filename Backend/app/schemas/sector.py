from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.models.sector import ParameterTypeEnum


class SectorCreate(BaseModel):
    name: str
    description: Optional[str] = None


class SectorOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SectorParameterCreate(BaseModel):
    name: str
    key: str
    type: ParameterTypeEnum
    is_required: bool = False
    display_order: int = 0


class SectorParameterUpdate(BaseModel):
    name: Optional[str] = None
    key: Optional[str] = None
    type: Optional[ParameterTypeEnum] = None
    is_required: Optional[bool] = None
    display_order: Optional[int] = None


class SectorParameterOut(BaseModel):
    id: int
    sector_id: int
    name: str
    key: str
    type: ParameterTypeEnum
    is_required: bool
    display_order: int

    class Config:
        from_attributes = True
