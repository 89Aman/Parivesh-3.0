"""Seed script - uses raw SQL via asyncpg to avoid ORM issues."""
import asyncio
import uuid
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DB_URL = "postgresql+asyncpg://postgres.ltlfgqyaxuuzltflfzls:vZbtfPmKWtqheDTX@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

engine = create_async_engine(DB_URL, echo=False)
ASL = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


def hash_pw(pw):
    return pwd_context.hash(pw)


async def seed():
    async with ASL() as db:
        # Check if users exist
        r = await db.execute(text("SELECT count(*) FROM users"))
        cnt = r.scalar()
        if cnt > 0:
            print(f"Users already exist ({cnt} rows). Skipping seed.")
            await engine.dispose()
            return

        print("Seeding users...")
        users = [
            ("admin@parivesh.com", "admin123", "Admin User", "Parivesh Admin", "9000000001"),
            ("pp@parivesh.com", "pp123", "PP User", "Green Mining Corp", "9000000002"),
            ("scrutiny@parivesh.com", "scrutiny123", "Scrutiny Officer", "MoEFCC", "9000000003"),
            ("mom@parivesh.com", "mom123", "MoM Team Member", "MoEFCC", "9000000004"),
        ]

        user_ids = {}
        for email, pw, name, org, phone in users:
            uid = str(uuid.uuid4())
            pw_hash = hash_pw(pw)
            await db.execute(
                text(
                    "INSERT INTO users (id, email, password_hash, full_name, organization, phone, is_active) "
                    "VALUES (:id, :email, :pw, :name, :org, :phone, true)"
                ),
                {"id": uid, "email": email, "pw": pw_hash, "name": name, "org": org, "phone": phone},
            )
            user_ids[email] = uid
            print(f"  User: {email} -> {uid}")

        # Assign roles
        print("Assigning roles...")
        role_map = {"ADMIN": 1, "PP": 2, "SCRUTINY": 4, "MOM": 5}
        assignments = [
            ("admin@parivesh.com", "ADMIN"),
            ("pp@parivesh.com", "PP"),
            ("scrutiny@parivesh.com", "SCRUTINY"),
            ("mom@parivesh.com", "MOM"),
        ]
        for email, role_name in assignments:
            await db.execute(
                text("INSERT INTO user_roles (user_id, role_id) VALUES (:uid, :rid)"),
                {"uid": user_ids[email], "rid": role_map[role_name]},
            )
            print(f"  Role: {email} -> {role_name}")

        # Sectors
        print("Seeding sectors...")
        r = await db.execute(text("SELECT count(*) FROM sectors"))
        if r.scalar() == 0:
            for name, desc in [
                ("Mining", "Mining and mineral extraction projects"),
                ("Infrastructure", "Infrastructure development projects"),
                ("Industry", "Industrial manufacturing projects"),
            ]:
                await db.execute(
                    text("INSERT INTO sectors (name, description) VALUES (:name, :desc)"),
                    {"name": name, "desc": desc},
                )
                print(f"  Sector: {name}")

        await db.commit()

        # Get sector IDs
        r = await db.execute(text("SELECT id, name FROM sectors"))
        sector_map = {row[1]: row[0] for row in r.fetchall()}
        mining_id = sector_map.get("Mining")
        print(f"  Mining id: {mining_id}")

        # Sector parameters
        if mining_id:
            r = await db.execute(
                text("SELECT count(*) FROM sector_parameters WHERE sector_id = :sid"),
                {"sid": mining_id},
            )
            if r.scalar() == 0:
                print("Seeding sector parameters...")
                params = [
                    ("Production Capacity", "production_capacity", "TEXT", True, 1),
                    ("Mine Area (sq km)", "mine_area", "NUMBER", True, 2),
                    ("Is Open Cast Mine", "is_open_cast", "BOOLEAN", False, 3),
                ]
                for name, key, ptype, req, order in params:
                    await db.execute(
                        text(
                            "INSERT INTO sector_parameters (sector_id, name, key, type, is_required, display_order) "
                            "VALUES (:sid, :name, :key, :type, :req, :ord)"
                        ),
                        {"sid": mining_id, "name": name, "key": key, "type": ptype, "req": req, "ord": order},
                    )
                print("  3 parameters created")

            # Gist template
            r = await db.execute(text("SELECT count(*) FROM gist_templates"))
            if r.scalar() == 0:
                print("Seeding gist template...")
                content = (
                    "PROJECT GIST\n\n"
                    "Project Name: {{project_name}}\n"
                    "Category: {{category}}\n\n"
                    "LOCATION:\n"
                    "  State: {{state}}, District: {{district}}\n"
                    "  Taluk: {{taluk}}, Village: {{village}}\n"
                    "  Pincode: {{pincode}}\n"
                    "  Coordinates: {{latitude}}, {{longitude}}\n\n"
                    "PROJECT DETAILS:\n"
                    "  Area: {{project_area_ha}} ha\n"
                    "  Capacity: {{capacity}}\n"
                    "  Production: {{production_capacity}}\n"
                    "  Mine Area: {{mine_area}} sq km\n"
                    "  Open Cast: {{is_open_cast}}\n\n"
                    "DESCRIPTION:\n{{project_description}}\n\n"
                    "---\nAuto-generated by Parivesh."
                )
                await db.execute(
                    text(
                        "INSERT INTO gist_templates (name, category, sector_id, content, version, is_active, created_by) "
                        "VALUES (:name, :cat, :sid, :content, 1, true, :uid)"
                    ),
                    {
                        "name": "Mining Cat-A Template",
                        "cat": "A",
                        "sid": mining_id,
                        "content": content,
                        "uid": user_ids["admin@parivesh.com"],
                    },
                )
                print("  Template created")

        await db.commit()

    await engine.dispose()
    print("\n=== SEED COMPLETE ===")
    print("Credentials:")
    print("  admin@parivesh.com / admin123")
    print("  pp@parivesh.com / pp123")
    print("  scrutiny@parivesh.com / scrutiny123")
    print("  mom@parivesh.com / mom123")


if __name__ == "__main__":
    asyncio.run(seed())
