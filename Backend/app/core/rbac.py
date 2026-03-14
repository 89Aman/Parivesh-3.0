from typing import List, Callable
from fastapi import Depends, HTTPException, status
from app.core.auth import get_current_user
from app.models.user import User

def require_role(*allowed_roles: str) -> Callable:
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_names = [
            (role.name.value if hasattr(role.name, "value") else str(role.name))
            for role in (current_user.roles or [])
        ]
        # Admins can do anything
        if "ADMIN" in user_role_names:
            return current_user
        if bool(set(allowed_roles) & set(user_role_names)):
            return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted",
        )
    return role_checker
