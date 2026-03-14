"""
Search Router — global full-text search across applications.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.db import get_db
from app.core.rbac import require_role
from app.models.user import User
from app.models.application import Application

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("")
async def global_search(
    q: str = Query(..., min_length=1, max_length=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "SCRUTINY", "MOM", "PP", "RQP")),
):
    """Search applications by project name, ID, state, or district."""
    q_clean = q.strip()

    result = await db.execute(
        select(
            Application.id,
            Application.project_name,
            Application.status,
            Application.category,
            Application.state,
            Application.district,
            Application.sector_id,
            Application.created_at,
        )
        .filter(
            Application.project_name.ilike(f"%{q_clean}%")
            | Application.state.ilike(f"%{q_clean}%")
            | Application.district.ilike(f"%{q_clean}%")
            | Application.category.ilike(f"%{q_clean}%")
        )
        .order_by(Application.created_at.desc())
        .limit(10)
    )

    rows = result.all()
    return [
        {
            "id": str(row.id),
            "project_name": row.project_name,
            "status": row.status,
            "category": row.category,
            "state": row.state,
            "district": row.district,
            "sector_id": row.sector_id,
        }
        for row in rows
    ]
