import asyncio
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.db import get_db
from app.models.user import User
from app.services.user_service import UserService

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def _credentials_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Could not validate credentials",
    )


async def _get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(
        select(User).options(selectinload(User.roles)).filter(User.id == user_id)
    )
    return result.scalars().first()


async def _get_user_by_local_jwt(db: AsyncSession, token: str) -> User | None:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=["HS256"]
        )
        user_id: str | None = payload.get("sub")
        if not user_id:
            return None
    except (JWTError, ValidationError):
        return None

    return await _get_user_by_id(db, user_id)


def _fetch_supabase_user_sync(token: str) -> dict | None:
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        return None

    request = Request(
        f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": settings.SUPABASE_ANON_KEY,
        },
    )

    try:
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        if error.code in (401, 403):
            return None
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase auth validation failed",
        ) from error
    except URLError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase auth service is unavailable",
        ) from error


async def _get_user_by_supabase_token(db: AsyncSession, token: str) -> User | None:
    supabase_user = await asyncio.to_thread(_fetch_supabase_user_sync, token)
    if not supabase_user:
        return None

    email = supabase_user.get("email")
    if not email:
        return None

    local_user = await UserService.get_by_email(db, email)
    if local_user:
        return local_user

    metadata = supabase_user.get("user_metadata") or {}
    full_name = (
        metadata.get("full_name")
        or metadata.get("name")
        or email.split("@", 1)[0]
    )

    local_user = await UserService.create_external_user(
        db,
        email=email,
        full_name=full_name,
        organization=metadata.get("organization"),
        phone=metadata.get("phone"),
    )
    await db.commit()
    return local_user


async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    user = await _get_user_by_local_jwt(db, token)
    if not user:
        user = await _get_user_by_supabase_token(db, token)

    if not user:
        raise _credentials_error()
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user
