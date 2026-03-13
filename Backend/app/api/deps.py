from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.auth import get_current_user
from app.models.user import User


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user
