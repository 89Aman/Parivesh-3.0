import asyncio
import os
import sys
from uuid import UUID

# Add current directory to path
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.future import select
from app.core.config import settings
from app.models.application import Application, ApplicationStatus
from app.models.compliance import ComplianceTask
from app.services.compliance import ComplianceService

async def populate_compliance():
    engine = create_async_engine(settings.DATABASE_URL)
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as db:
        # Find all finalized applications
        result = await db.execute(
            select(Application).filter(Application.status == ApplicationStatus.FINALIZED)
        )
        finalized_apps = result.scalars().all()
        
        print(f"Found {len(finalized_apps)} finalized applications.")
        
        for app in finalized_apps:
            # Check if tasks already exist
            task_check = await db.execute(
                select(ComplianceTask).filter(ComplianceTask.application_id == app.id)
            )
            if task_check.scalars().first():
                print(f"Tasks already exist for application {app.id}. Skipping.")
                continue
            
            print(f"Generating tasks for application {app.id}...")
            await ComplianceService.generate_tasks(db, app.id)
        
        await db.commit()
    
    await engine.dispose()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(populate_compliance())
