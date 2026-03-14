"""Seed the admin user using the .env DATABASE_URL."""
import asyncio
import uuid
import bcrypt
import os
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text


def load_env():
    """Load key=value pairs from .env into a dict."""
    env_path = Path(__file__).parent / ".env"
    env_vars = {}
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    env_vars[key.strip()] = val.strip().strip('"').strip("'")
    return env_vars


ENV = load_env()

DB_URL = ENV.get("DATABASE_URL", os.environ.get("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/parivesh"))
ADMIN_EMAIL = ENV.get("ADMIN_EMAIL", os.environ.get("ADMIN_EMAIL", "admin@parivesh.gov.in"))
ADMIN_PASSWORD = ENV.get("ADMIN_PASSWORD", os.environ.get("ADMIN_PASSWORD", "admin123"))

engine = create_async_engine(DB_URL, echo=False)
ASL = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


def hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


async def seed_roles():
    """Ensure all standard roles exist."""
    roles = [
        ("ADMIN", "Administrator"),
        ("PP", "Project Proponent"),
        ("RQP", "Registered Qualified Person"),
        ("SCRUTINY", "Scrutiny Officer"),
        ("MOM", "Minutes of Meeting"),
    ]

    async with ASL() as db:
        for role_name, label in roles:
            r = await db.execute(
                text("SELECT id FROM roles WHERE name = :name"),
                {"name": role_name},
            )
            if not r.scalar():
                await db.execute(
                    text("INSERT INTO roles (name, label) VALUES (:name, :label)"),
                    {"name": role_name, "label": label},
                )
                print(f"  Created role: {role_name} ({label})")
            else:
                await db.execute(
                    text("UPDATE roles SET label = :label WHERE name = :name AND (label IS NULL OR label = '')"),
                    {"name": role_name, "label": label},
                )
        await db.commit()
    print("All roles seeded.")


async def add_admin():
    print(f"Using database: {DB_URL[:60]}...")
    print(f"Admin email: {ADMIN_EMAIL}")

    # 1. Create schema for all models
    from app.core.db import Base
    import app.models  # load all models into Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Schema created.")

    # 2. Seed all roles
    await seed_roles()

    async with ASL() as db:
        # 2. Check if user already exists
        r = await db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": ADMIN_EMAIL},
        )
        existing = r.scalar()

        if existing:
            uid = str(existing)
            print(f"User {ADMIN_EMAIL} already exists (id: {uid}). Ensuring ADMIN role...")
        else:
            uid = uuid.uuid4().hex  # Insert without hyphens for SQLite compatibility
            pw_hash = hash_pw(ADMIN_PASSWORD)
            await db.execute(
                text(
                    "INSERT INTO users (id, email, password_hash, full_name, organization, is_active) "
                    "VALUES (:id, :email, :pw, :name, :org, true)"
                ),
                {"id": uid, "email": ADMIN_EMAIL, "pw": pw_hash, "name": "Admin", "org": "Parivesh Admin"},
            )
            print(f"Created user {ADMIN_EMAIL} -> {uid}")

        # 3. Get ADMIN role id
        r = await db.execute(text("SELECT id FROM roles WHERE name = 'ADMIN'"))
        admin_role_id = r.scalar()

        if not admin_role_id:
            raise Exception("ADMIN role not found after seeding!")

        # 4. Assign role
        r = await db.execute(
            text("SELECT 1 FROM user_roles WHERE user_id = :uid AND role_id = :rid"),
            {"uid": uid, "rid": admin_role_id},
        )
        if not r.scalar():
            await db.execute(
                text("INSERT INTO user_roles (user_id, role_id) VALUES (:uid, :rid)"),
                {"uid": uid, "rid": admin_role_id},
            )
            print("Assigned ADMIN role.")

        await db.commit()

    await engine.dispose()
    print("\n=== SUCCESS ===")
    print(f"User: {ADMIN_EMAIL}")
    print(f"Password: {ADMIN_PASSWORD}")
    print("Role: ADMIN")


if __name__ == "__main__":
    asyncio.run(add_admin())
