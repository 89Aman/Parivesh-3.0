from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.rbac import require_role
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate, ApplicationUpdate, ApplicationOut,
    ApplicationParameterSet, ApplicationParameterOut,
)
from app.schemas.document import DocumentOut
from app.schemas.payment import PaymentSimulateRequest, PaymentOut
from app.schemas.eds import EDSRequestOut, EDSResolveRequest
from app.schemas.user import UserOut, UserUpdate
from app.services.application_service import ApplicationService
from app.services.document_service import DocumentService
from app.services.payment_service import PaymentService
from app.services.eds_service import EDSService
from app.services.naas_service import NaaSService

router = APIRouter(prefix="/pp", tags=["PP / Project Proponent"])


# ──── Profile ────


@router.get("/profile", response_model=UserOut)
async def get_profile(current_user: User = Depends(require_role("PP", "RQP"))):
    return current_user


@router.put("/profile", response_model=UserOut)
async def update_profile(
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(current_user, key, val)
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


# ──── Applications ────


@router.get("/applications", response_model=list[ApplicationOut])
async def list_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    is_admin = any(r.name.value == "ADMIN" for r in current_user.roles)
    if is_admin:
        return await ApplicationService.list_all(db)
    return await ApplicationService.list_by_owner(db, current_user.id)


@router.get("/applications/{app_id}", response_model=ApplicationOut)
async def get_application(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    app = await ApplicationService.get_by_id(db, app_id)
    # Check roles - Admins can see everything
    is_admin = any(r.name.value == "ADMIN" for r in current_user.roles)
    if not is_admin and app.applicant_id != current_user.id:
        from app.core.exceptions import ForbiddenException
        raise ForbiddenException("Not the owner of this application")
    return app


@router.post("/applications", response_model=ApplicationOut)
async def create_application(
    data: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    app = await ApplicationService.create(db, data.model_dump(), current_user.id)
    await db.commit()
    await db.refresh(app)
    return app


@router.put("/applications/{app_id}", response_model=ApplicationOut)
async def update_application(
    app_id: UUID,
    data: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    app = await ApplicationService.update(
        db, app_id, data.model_dump(exclude_unset=True), current_user.id
    )
    await db.commit()
    await db.refresh(app)
    return app


@router.post("/applications/{app_id}/submit", response_model=ApplicationOut)
async def submit_application(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    role = "PP"
    for r in current_user.roles:
        if r.name.value in ("PP", "RQP"):
            role = r.name.value
            break
    app = await ApplicationService.submit(db, app_id, current_user.id, role)
    await db.commit()
    await db.refresh(app)
    await NaaSService.emit_event(
        "APPLICATION_SUBMITTED",
        {
            "application_id": str(app.id),
            "applicant_id": str(current_user.id),
            "project_name": app.project_name,
            "status": app.status,
            "actor_role": role,
        },
    )
    return app


# ──── Parameters ────


@router.post("/applications/{app_id}/parameters", response_model=list[ApplicationParameterOut])
async def set_parameters(
    app_id: UUID,
    params: list[ApplicationParameterSet],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    result = await ApplicationService.set_parameters(
        db, app_id, [p.model_dump() for p in params]
    )
    await db.commit()
    return result


# ──── Documents ────


@router.post("/applications/{app_id}/documents", response_model=DocumentOut)
async def upload_document(
    app_id: UUID,
    name: str,
    file_path: str,
    mime_type: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    doc = await DocumentService.upload(db, app_id, name, file_path, mime_type, current_user.id)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.get("/applications/{app_id}/documents", response_model=list[DocumentOut])
async def list_documents(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    return await DocumentService.list_for_application(db, app_id)


# ──── Payment Simulation ────


@router.post("/applications/{app_id}/payment/simulate", response_model=PaymentOut)
async def simulate_payment(
    app_id: UUID,
    data: PaymentSimulateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    payment = await PaymentService.simulate_payment(db, app_id, data.amount)
    await db.commit()
    await db.refresh(payment)
    return payment


@router.get("/applications/{app_id}/payment", response_model=Optional[PaymentOut])
async def get_payment(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    payment = await PaymentService.get_for_application(db, app_id)
    return payment


# ──── EDS Response ────


@router.get("/applications/{app_id}/eds", response_model=EDSRequestOut)
async def get_eds(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    eds = await EDSService.get_current_eds(db, app_id)
    if not eds:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("EDS Request")
    return eds


@router.post("/applications/{app_id}/eds/resolve", response_model=EDSRequestOut)
async def resolve_eds(
    app_id: UUID,
    data: EDSResolveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("PP", "RQP")),
):
    eds = await EDSService.resolve_eds(db, app_id, current_user.id, data.resolution_text)
    await db.commit()
    await db.refresh(eds)
    return eds
