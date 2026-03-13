from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    roles: list[str] = []


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterPPRequest(BaseModel):
    email: str
    password: str
    full_name: str
    organization: Optional[str] = None
    phone: Optional[str] = None
