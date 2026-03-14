"""
Analytics Router — dashboard KPIs and charts for Admin.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func as sql_func
from sqlalchemy import cast, Integer

from app.core.db import get_db
from app.core.rbac import require_role
from app.models.user import User
from app.models.application import Application, ApplicationStatus
from app.models.eds import EDSRequest
from app.models.meeting import Meeting

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def analytics_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    """Returns applications grouped by status."""
    result = await db.execute(
        select(Application.status, sql_func.count(Application.id).label("count"))
        .group_by(Application.status)
    )
    by_status = [{"status": row.status, "count": row.count} for row in result]

    total_result = await db.execute(select(sql_func.count(Application.id)))
    total = total_result.scalar() or 0

    finalized_result = await db.execute(
        select(sql_func.count(Application.id)).filter(
            Application.status == ApplicationStatus.FINALIZED
        )
    )
    finalized = finalized_result.scalar() or 0

    return {
        "total_applications": total,
        "total_finalized": finalized,
        "by_status": by_status,
    }


@router.get("/by-sector")
async def analytics_by_sector(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    """Returns application count and EDS rate per sector."""
    result = await db.execute(
        select(Application.sector_id, sql_func.count(Application.id).label("count"))
        .group_by(Application.sector_id)
        .order_by(sql_func.count(Application.id).desc())
    )
    rows = [{"sector_id": row.sector_id, "count": row.count} for row in result]
    return rows


@router.get("/monthly-trend")
async def analytics_monthly_trend(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    """Returns monthly application submission counts for the last 12 months."""
    from sqlalchemy import text as sa_text
    result = await db.execute(
        sa_text("""
            SELECT to_char(created_at, 'YYYY-MM') AS month,
                   COUNT(id)                       AS count
            FROM   applications
            GROUP  BY to_char(created_at, 'YYYY-MM')
            ORDER  BY to_char(created_at, 'YYYY-MM')
            LIMIT  12
        """)
    )
    return [{"month": row.month, "count": row.count} for row in result]
