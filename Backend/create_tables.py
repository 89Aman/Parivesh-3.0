import asyncio
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from app.core.db import engine, Base
# Import models to register them with Base
import app.models 

async def create_tables():
    print("Creating tables...")
    async with engine.begin() as conn:
        # This will create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)
    print("Done!")

if __name__ == "__main__":
    asyncio.run(create_tables())
