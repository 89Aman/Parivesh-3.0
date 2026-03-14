import asyncio
from sqlalchemy import text
from app.core.db import engine, AsyncSessionLocal
from app.models.user import User, Role, UserRole, UserRoleEnum, ROLE_LABELS
from app.core.security import get_password_hash
import uuid

async def sync():
    async with AsyncSessionLocal() as session:
        # 1. Ensure Roles exist using raw SQL to be safe
        roles_to_seed = ["ADMIN", "PP", "RQP", "SCRUTINY", "MOM"]
        for rname in roles_to_seed:
            res = await session.execute(text("SELECT id FROM roles WHERE name = :name"), {"name": rname})
            if not res.fetchone():
                print(f"Adding role {rname}...")
                label = ROLE_LABELS.get(rname, "")
                await session.execute(
                    text("INSERT INTO roles (name, label) VALUES (:name, :label)"),
                    {"name": rname, "label": label}
                )
        
        await session.commit()
        print("Roles handled.")

        # 2. Add System Admin
        admin_email = "shasarita23@gmail.com"
        res = await session.execute(text("SELECT id FROM users WHERE email = :email"), {"email": admin_email})
        admin_row = res.fetchone()
        
        if not admin_row:
            print(f"Creating admin {admin_email}...")
            admin_id = uuid.uuid4()
            pwd_hash = get_password_hash("admin123")
            await session.execute(
                text("INSERT INTO users (id, email, password_hash, full_name, is_active) VALUES (:id, :email, :pwd, :name, :active)"),
                {"id": admin_id, "email": admin_email, "pwd": pwd_hash, "name": "System Administrator", "active": True}
            )
        else:
            admin_id = admin_row[0]

        # 3. Assign ADMIN role
        res = await session.execute(text("SELECT id FROM roles WHERE name = 'ADMIN'"))
        role_id = res.fetchone()[0]
        
        res = await session.execute(
            text("SELECT 1 FROM user_roles WHERE user_id = :uid AND role_id = :rid"),
            {"uid": admin_id, "rid": role_id}
        )
        if not res.fetchone():
            print(f"Assigning ADMIN role to {admin_email}...")
            await session.execute(
                text("INSERT INTO user_roles (user_id, role_id) VALUES (:uid, :rid)"),
                {"uid": admin_id, "rid": role_id}
            )
        
        await session.commit()
        print("Sync complete.")

if __name__ == "__main__":
    asyncio.run(sync())
