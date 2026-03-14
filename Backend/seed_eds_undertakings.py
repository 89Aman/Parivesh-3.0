"""
Seed script for EDS Standard Points and PP Undertaking Conditions.
"""
import asyncio
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from app.core.config import settings
from app.core.eds_seed_data import get_ordered_points
from app.core.pp_undertaking_seed_data import get_ordered_undertaking_points

async def seed_eds_and_undertakings():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    ASL = async_sessionmaker(bind=engine, class_=AsyncSession)

    async with ASL() as db:
        # 1. Seed EDS Standard Points
        print("Checking EDS Standard Points...")
        r = await db.execute(text("SELECT count(*) FROM eds_standard_points"))
        if r.scalar() == 0:
            print("Seeding EDS Standard Points...")
            points = get_ordered_points()
            for p in points:
                await db.execute(
                    text(
                        "INSERT INTO eds_standard_points (code, label, category, display_order, is_active) "
                        "VALUES (:code, :label, :category, :order, :active)"
                    ),
                    {
                        "code": p["code"],
                        "label": p["label"],
                        "category": p["category"],
                        "order": p["display_order"],
                        "active": True
                    }
                )
            print(f"  Inserted {len(points)} EDS points.")
        else:
            print("  EDS points already exist. Skipping.")

        # 2. Seed PP Undertakings
        print("Checking PP Undertaking Points...")
        r = await db.execute(text("SELECT count(*) FROM pp_undertakings"))
        if r.scalar() == 0:
            print("Seeding PP Undertaking Points...")
            undertakings = get_ordered_undertaking_points()
            for u in undertakings:
                await db.execute(
                    text(
                        "INSERT INTO pp_undertakings (code, label, mineral_type, display_order, is_active) "
                        "VALUES (:code, :label, :mtype, :order, :active)"
                    ),
                    {
                        "code": u["code"],
                        "label": u["label"],
                        "mtype": u["mineral_type"],
                        "order": u["display_order"],
                        "active": True
                    }
                )
            print(f"  Inserted {len(undertakings)} undertaking points.")
        else:
            print("  Undertaking points already exist. Skipping.")

        await db.commit()

    await engine.dispose()
    print("\n=== EDS & UNDERTAKING SEED COMPLETE ===")

if __name__ == "__main__":
    asyncio.run(seed_eds_and_undertakings())
