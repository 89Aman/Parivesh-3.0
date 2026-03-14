from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserBase(BaseModel):
    email: str
    full_name: str
    organization: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    organization: Optional[str] = None
    phone: Optional[str] = None


class AdminUserUpdate(UserUpdate):
    role_name: Optional[str] = None


class RoleOut(BaseModel):
    id: int
    name: str
    label: Optional[str] = ""

    class Config:
        from_attributes = True


class UserOut(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    roles: list[RoleOut] = []

    class Config:
        from_attributes = True


class AssignRoleRequest(BaseModel):
    role_name: str  # e.g. "SCRUTINY", "MOM"
