import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.ltlfgqyaxuuzltflfzls:vZbtfPmKWtqheDTX@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
engine = create_async_engine(DB_URL)

async def check():
    async with engine.connect() as conn:
        res = await conn.execute(text("""
            SELECT t.typname, e.enumlabel 
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid 
            ORDER BY t.typname, e.enumsortorder;
        """))
        types = {}
        for typname, enumlabel in res.fetchall():
            if typname not in types: types[typname] = []
            types[typname].append(enumlabel)
        for t, values in types.items():
            print(f"{t}: {values}")
    await engine.dispose()

asyncio.run(check())
