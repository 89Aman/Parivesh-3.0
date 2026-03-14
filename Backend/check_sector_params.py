import asyncio
from app.core.db import AsyncSessionLocal
from sqlalchemy.future import select
from app.models.sector import SectorParameter

async def check_params():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(SectorParameter).filter(SectorParameter.sector_id == 1))
        params = res.scalars().all()
        for p in params:
            print(f"ID: {p.id}, Key: {p.key}, Name: {p.name}")


if __name__ == "__main__":
    asyncio.run(check_params())
