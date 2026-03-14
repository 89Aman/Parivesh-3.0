from pydantic import BaseModel
from typing import Optional

from app.schemas.user import UserOut


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(Token):
    user: UserOut


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
