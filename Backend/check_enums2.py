import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.ltlfgqyaxuuzltflfzls:vZbtfPmKWtqheDTX@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
engine = create_async_engine(DB_URL)

async def check():
    async with engine.connect() as conn:
        res = await conn.execute(text("""
            SELECT t.typname
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid 
            GROUP BY t.typname;
        """))
        types = [row[0] for row in res.fetchall()]
        print('ENUMS:', ', '.join(types))
    await engine.dispose()

asyncio.run(check())
