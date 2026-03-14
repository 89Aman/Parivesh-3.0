from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.db import get_db
from app.schemas.sector import SectorOut
from app.schemas.document_checklist import DocumentChecklistOut
from app.schemas.eds_standard_point import EDSStandardPointOut
from app.schemas.pp_undertaking import PPUndertakingOut
from app.services.template_service import TemplateService
from app.models.eds_standard_point import EDSStandardPoint
from app.models.pp_undertaking import PPUndertaking
from app.core.document_checklist_data import (
    DOCUMENT_CHECKLISTS,
    get_document_checklist_categories,
    get_document_checklist_for_category,
)

router = APIRouter(prefix="/metadata", tags=["Metadata / Public"])


@router.get("/sectors", response_model=list[SectorOut])
async def list_sectors(db: AsyncSession = Depends(get_db)):
    """
    List all available sectors. Publicly accessible.
    """
    return await TemplateService.list_sectors(db)


@router.get("/eds-points", response_model=list[EDSStandardPointOut])
async def list_eds_standard_points(db: AsyncSession = Depends(get_db)):
    """
    Return the master catalogue of standard EDS points, ordered by category
    and display_order.  Used by the Scrutiny portal to render the EDS checklist.
    """
    result = await db.execute(
        select(EDSStandardPoint)
        .filter(EDSStandardPoint.is_active == True)
        .order_by(EDSStandardPoint.category, EDSStandardPoint.display_order)
    )
    return list(result.scalars().all())


@router.post("/eds-points/seed", response_model=dict)
async def seed_eds_standard_points(db: AsyncSession = Depends(get_db)):
    """
    Populate the eds_standard_points table from the built-in seed data.
    Skips rows whose code already exists (idempotent).
    """
    from app.core.eds_seed_data import get_ordered_points

    existing_result = await db.execute(select(EDSStandardPoint.code))
    existing_codes = set(existing_result.scalars().all())

    inserted = 0
    for point_data in get_ordered_points():
        if point_data["code"] in existing_codes:
            continue
        db.add(EDSStandardPoint(**point_data))
        inserted += 1

    await db.commit()
    return {"inserted": inserted, "skipped": len(existing_codes)}


@router.get("/pp-undertakings", response_model=list[PPUndertakingOut])
async def list_pp_undertakings(db: AsyncSession = Depends(get_db)):
    """
    Return the master catalogue of PP Undertakings, ordered by mineral_type
    and display_order. Used by the PP portal to render the submission checklist.
    """
    result = await db.execute(
        select(PPUndertaking)
        .filter(PPUndertaking.is_active == True)
        .order_by(PPUndertaking.mineral_type, PPUndertaking.display_order)
    )
    return list(result.scalars().all())


@router.post("/pp-undertakings/seed", response_model=dict)
async def seed_pp_undertakings(db: AsyncSession = Depends(get_db)):
    """
    Populate the pp_undertakings table from the built-in seed data.
    """
    from app.core.pp_undertaking_seed_data import get_ordered_undertaking_points

    existing_result = await db.execute(select(PPUndertaking.code))
    existing_codes = set(existing_result.scalars().all())

    inserted = 0
    for point_data in get_ordered_undertaking_points():
        if point_data["code"] in existing_codes:
            continue
        db.add(PPUndertaking(**point_data))
        inserted += 1

    await db.commit()
    return {"inserted": inserted, "skipped": len(existing_codes)}


@router.get("/document-checklists", response_model=list[str])
async def list_document_checklist_categories():
    """
    Return supported categories with predefined required-document checklists.
    """
    return get_document_checklist_categories()


@router.get("/document-checklists/{category}", response_model=DocumentChecklistOut)
async def get_document_checklist(category: str):
    """
    Return required document checklist rows for a category.
    """
    normalized = (category or "").strip().upper()
    if normalized not in DOCUMENT_CHECKLISTS:
        raise HTTPException(
            status_code=404,
            detail=f"Checklist category '{category}' not found.",
        )

    return {
        "category": normalized,
        "items": get_document_checklist_for_category(normalized),
    }
