from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, RegisterPPRequest, Token
from app.schemas.user import UserOut
from app.services.user_service import UserService
from app.core.exceptions import BadRequestException

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=Token)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await UserService.authenticate(db, data.email, data.password)
    if not user:
        raise BadRequestException("Incorrect email or password")
    roles = [role.name.value for role in user.roles]
    access_token = create_access_token(subject=str(user.id), roles=roles)
    return Token(access_token=access_token)


@router.post("/register-pp", response_model=UserOut)
async def register_pp(data: RegisterPPRequest, db: AsyncSession = Depends(get_db)):
    user = await UserService.create_pp_user(
        db,
        email=data.email,
        password=data.password,
        full_name=data.full_name,
        organization=data.organization,
        phone=data.phone,
    )
    await db.commit()
    return user
