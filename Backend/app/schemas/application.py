from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


# ---------- Application ----------

class ApplicationCreate(BaseModel):
    project_name: str
    project_description: Optional[str] = None
    category: str  # A, B1, B2
    sector_id: int
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    project_area_ha: Optional[float] = None
    capacity: Optional[str] = None


class ApplicationUpdate(BaseModel):
    project_name: Optional[str] = None
    project_description: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    project_area_ha: Optional[float] = None
    capacity: Optional[str] = None


class ApplicationOut(BaseModel):
    id: UUID
    applicant_id: UUID
    project_name: str
    project_description: Optional[str] = None
    category: str
    sector_id: int
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    project_area_ha: Optional[float] = None
    capacity: Optional[str] = None
    status: str
    eds_cycle_count: int
    risk_score: int = 0
    risk_level: str = "LOW"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Application Parameters ----------

class ApplicationParameterSet(BaseModel):
    sector_parameter_id: int
    value_text: Optional[str] = None
    value_number: Optional[float] = None
    value_boolean: Optional[bool] = None


class ApplicationParameterOut(BaseModel):
    id: int
    sector_parameter_id: int
    value_text: Optional[str] = None
    value_number: Optional[float] = None
    value_boolean: Optional[bool] = None

    class Config:
        from_attributes = True


# ---------- Status History ----------

class StatusHistoryOut(BaseModel):
    id: int
    from_status: Optional[str] = None
    to_status: str
    changed_by_role: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
