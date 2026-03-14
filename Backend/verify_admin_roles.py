
import asyncio
from sqlalchemy import text
from app.core.db import AsyncSessionLocal

async def check_admin():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("""
            SELECT u.email, r.name 
            FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE u.email = 'shasarita23@gmail.com'
        """))
        rows = res.fetchall()
        print(f"Roles for shasarita23@gmail.com:")
        for row in rows:
            print(f"- {row[1]}")

if __name__ == "__main__":
    asyncio.run(check_admin())
