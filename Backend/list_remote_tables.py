
import asyncio
from sqlalchemy import text
from app.core.db import engine

async def list_remote_tables():
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = result.fetchall()
        print("Tables in public schema:")
        for table in tables:
            print(f"- {table[0]}")

if __name__ == "__main__":
    asyncio.run(list_remote_tables())
