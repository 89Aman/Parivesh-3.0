import asyncio
import json
import uuid
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.db import get_db
from app.models.user import User
from app.services.user_service import UserService

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def _credentials_error(detail: str = "Could not validate credentials") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail,
    )

async def _get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    try:
        uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
    except ValueError:
        return None
    result = await db.execute(
        select(User).options(selectinload(User.roles)).filter(User.id == uid)
    )
    return result.scalars().first()


async def _get_user_by_local_jwt(db: AsyncSession, token: str) -> User | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str | None = payload.get("sub")
        if not user_id:
            return None
    except (JWTError, ValidationError):
        return None

    return await _get_user_by_id(db, user_id)


def _build_supabase_user_url() -> str | None:
    if not settings.SUPABASE_URL:
        return None
    return f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user"


async def _fetch_supabase_user(token: str) -> dict | None:
    user_url = _build_supabase_user_url()
    if not user_url or not settings.SUPABASE_ANON_KEY:
        return None

    request = Request(
        user_url,
        headers={
            "apikey": settings.SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {token}",
        },
        method="GET",
    )

    def _request() -> dict | None:
        with urlopen(request, timeout=8) as response:
            body = response.read().decode("utf-8")
            if not body:
                return None
            return json.loads(body)

    try:
        return await asyncio.to_thread(_request)
    except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError):
        return None


def _full_name_from_supabase_payload(payload: dict, email: str) -> str:
    metadata = payload.get("user_metadata") or {}
    full_name = (
        metadata.get("full_name")
        or metadata.get("name")
        or metadata.get("display_name")
        or email.split("@")[0]
    )
    return str(full_name).strip() or email.split("@")[0]


async def _get_user_by_supabase_token(db: AsyncSession, token: str) -> User | None:
    payload = await _fetch_supabase_user(token)
    if not payload:
        return None

    email = payload.get("email")
    if not email:
        return None

    existing = await UserService.get_by_email(db, email)
    if existing:
        return existing

    full_name = _full_name_from_supabase_payload(payload, email)
    organization = (payload.get("user_metadata") or {}).get("organization")
    phone = (payload.get("user_metadata") or {}).get("phone")

    user = await UserService.create_external_user(
        db,
        email=email,
        full_name=full_name,
        organization=organization,
        phone=phone,
    )
    if user:
        await db.commit()
    return user


async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    user = await _get_user_by_local_jwt(db, token)
    if not user:
        user = await _get_user_by_supabase_token(db, token)

    if not user:
        raise _credentials_error("Failed to validate local JWT or Supabase token. Please log in again.")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user
