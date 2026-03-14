"""
Compliance Service — auto-generates post-clearance compliance tasks when
an application reaches FINALIZED status.
"""
from datetime import date, timedelta
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.compliance import ComplianceTask

DEFAULT_TASKS = [
    {
        "task_name": "Submit Half-yearly EMP (Environment Management Plan) Report",
        "description": "Submit a detailed compliance report on the Environment Management Plan within 6 months.",
        "days_offset": 180,
    },
    {
        "task_name": "Plant Compensatory Trees",
        "description": "Complete compensatory afforestation as per the Forest Conservation Act requirements.",
        "days_offset": 90,
    },
    {
        "task_name": "Submit Annual Environmental Statement",
        "description": "Submit the Annual Environmental Statement to the State Pollution Control Board.",
        "days_offset": 365,
    },
    {
        "task_name": "Install Continuous Ambient Air Quality Monitoring (CAAQM) Station",
        "description": "Install and operationalize CAAQM station as mandated in the EC letter.",
        "days_offset": 120,
    },
    {
        "task_name": "Submit Quarterly Ground Water Monitoring Report",
        "description": "Submit quarterly groundwater monitoring data to CPCB.",
        "days_offset": 90,
    },
]


class ComplianceService:

    @staticmethod
    async def generate_tasks(db: AsyncSession, application_id: UUID) -> list[ComplianceTask]:
        today = date.today()
        tasks = []
        for t in DEFAULT_TASKS:
            task = ComplianceTask(
                application_id=application_id,
                task_name=t["task_name"],
                description=t["description"],
                due_date=today + timedelta(days=t["days_offset"]),
                status="PENDING",
            )
            db.add(task)
            tasks.append(task)
        await db.flush()
        return tasks

    @staticmethod
    async def list_for_application(db: AsyncSession, application_id: UUID) -> list[ComplianceTask]:
        result = await db.execute(
            select(ComplianceTask)
            .filter(ComplianceTask.application_id == application_id)
            .order_by(ComplianceTask.due_date)
        )
        return list(result.scalars().all())

    @staticmethod
    async def list_all(db: AsyncSession) -> list[ComplianceTask]:
        result = await db.execute(
            select(ComplianceTask).order_by(ComplianceTask.due_date)
        )
        return list(result.scalars().all())

    @staticmethod
    async def submit_task(db: AsyncSession, task_id: UUID) -> ComplianceTask | None:
        from datetime import datetime, timezone
        result = await db.execute(
            select(ComplianceTask).filter(ComplianceTask.id == task_id)
        )
        task = result.scalars().first()
        if task:
            task.status = "SUBMITTED"
            task.submitted_at = datetime.now(timezone.utc)
            db.add(task)
            await db.flush()
        return task
