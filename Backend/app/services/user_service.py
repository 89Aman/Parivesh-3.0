from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.user import User, Role, UserRole, UserRoleEnum
from app.models.audit import AuditLog
from app.core.security import get_password_hash, verify_password
from app.core.exceptions import NotFoundException, BadRequestException


class UserService:

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> User | None:
        result = await db.execute(
            select(User).options(selectinload(User.roles)).filter(User.email == email)
        )
        return result.scalars().first()

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id) -> User | None:
        result = await db.execute(
            select(User).options(selectinload(User.roles)).filter(User.id == user_id)
        )
        return result.scalars().first()

    @staticmethod
    async def create_pp_user(db: AsyncSession, email: str, password: str, full_name: str,
                              organization: str | None = None, phone: str | None = None) -> User:
        existing = await UserService.get_by_email(db, email)
        if existing:
            raise BadRequestException("Email already registered")

        user = User(
            email=email,
            password_hash=get_password_hash(password),
            full_name=full_name,
            organization=organization,
            phone=phone,
        )
        db.add(user)
        await db.flush()

        # Assign PP role
        pp_role = await db.execute(select(Role).filter(Role.name == UserRoleEnum.PP))
        pp_role = pp_role.scalars().first()
        if pp_role:
            user_role = UserRole(user_id=user.id, role_id=pp_role.id)
            db.add(user_role)
            await db.flush()

        # Reload with roles
        return await UserService.get_by_id(db, user.id)

    @staticmethod
    async def authenticate(db: AsyncSession, email: str, password: str) -> User | None:
        user = await UserService.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    async def list_users(db: AsyncSession) -> list[User]:
        result = await db.execute(select(User).options(selectinload(User.roles)))
        return list(result.scalars().all())

    @staticmethod
    async def assign_role(db: AsyncSession, user_id, role_name: str, actor_id=None) -> User:
        user = await UserService.get_by_id(db, user_id)
        if not user:
            raise NotFoundException("User")

        try:
            role_enum = UserRoleEnum(role_name)
        except ValueError:
            raise BadRequestException(f"Invalid role: {role_name}")

        role = await db.execute(select(Role).filter(Role.name == role_enum))
        role = role.scalars().first()
        if not role:
            raise NotFoundException("Role")

        # Check if already has role
        existing = [r.name.value for r in user.roles]
        if role_name in existing:
            raise BadRequestException(f"User already has role {role_name}")

        user_role = UserRole(user_id=user.id, role_id=role.id)
        db.add(user_role)

        # Audit log
        audit = AuditLog(
            actor_id=actor_id,
            actor_role="ADMIN",
            action="ROLE_ASSIGN",
            description=f"Assigned role {role_name} to user {user.email}",
            entity_type="USER",
            entity_id=str(user.id),
        )
        db.add(audit)
        await db.flush()
        return await UserService.get_by_id(db, user_id)

    @staticmethod
    async def remove_role(db: AsyncSession, user_id, role_name: str, actor_id=None) -> User:
        user = await UserService.get_by_id(db, user_id)
        if not user:
            raise NotFoundException("User")

        try:
            role_enum = UserRoleEnum(role_name)
        except ValueError:
            raise BadRequestException(f"Invalid role: {role_name}")

        role = await db.execute(select(Role).filter(Role.name == role_enum))
        role = role.scalars().first()
        if not role:
            raise NotFoundException("Role")

        result = await db.execute(
            select(UserRole).filter(UserRole.user_id == user.id, UserRole.role_id == role.id)
        )
        user_role = result.scalars().first()
        if not user_role:
            raise BadRequestException(f"User does not have role {role_name}")

        await db.delete(user_role)

        audit = AuditLog(
            actor_id=actor_id,
            actor_role="ADMIN",
            action="ROLE_REMOVE",
            description=f"Removed role {role_name} from user {user.email}",
            entity_type="USER",
            entity_id=str(user.id),
        )
        db.add(audit)
        await db.flush()
        return await UserService.get_by_id(db, user_id)
