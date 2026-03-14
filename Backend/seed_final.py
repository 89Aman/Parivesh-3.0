"""Seed script using the app's existing configuration."""
import asyncio
import uuid
import bcrypt
import sys
import os

# Add current directory to path so we can import 'app'
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def seed_admin():
    email = "shasarita23@gmail.com"
    password = "admin123"
    
    # Create engine using the SAME URL the backend uses
    engine = create_async_engine(settings.DATABASE_URL)
    ASL = async_sessionmaker(bind=engine, class_=AsyncSession)

    async with ASL() as db:
        print(f"Connecting to database via settings...")
        
        # 1. Ensure user exists
        pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        
        # Check if exists
        result = await db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email})
        user_id = result.scalar()
        
        if not user_id:
            user_id = str(uuid.uuid4())
            await db.execute(
                text("INSERT INTO users (id, email, password_hash, full_name, organization, is_active) VALUES (:id, :email, :pw, 'Admin', 'Parivesh', True)"),
                {"id": user_id, "email": email, "pw": pw_hash}
            )
            print(f"Created user: {email}")
        else:
            # Update password just in case
            await db.execute(
                text("UPDATE users SET password_hash = :pw WHERE id = :id"),
                {"pw": pw_hash, "id": user_id}
            )
            print(f"Updated password for: {email}")

        # 2. Ensure ADMIN role exists
        result = await db.execute(text("SELECT id FROM roles WHERE name = 'ADMIN'"))
        role_id = result.scalar()
        
        if not role_id:
            await db.execute(text("INSERT INTO roles (name) VALUES ('ADMIN')"))
            result = await db.execute(text("SELECT id FROM roles WHERE name = 'ADMIN'"))
            role_id = result.scalar()

        # 3. Assign role
        check = await db.execute(
            text("SELECT 1 FROM user_roles WHERE user_id = :uid AND role_id = :rid"),
            {"uid": user_id, "rid": role_id}
        )
        if not check.scalar():
            await db.execute(
                text("INSERT INTO user_roles (user_id, role_id) VALUES (:uid, :rid)"),
                {"uid": user_id, "rid": role_id}
            )
            print("Assigned ADMIN role.")
        
        await db.commit()
    
    await engine.dispose()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(seed_admin())
