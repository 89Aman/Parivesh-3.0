from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.rbac import require_role
from app.models.user import User
from app.models.application import ApplicationStatus
from app.schemas.application import ApplicationOut
from app.schemas.payment import PaymentOut, PaymentSimulateRequest
from app.schemas.eds import EDSRequestCreate, EDSRequestOut
from app.schemas.meeting import MeetingCreate, MeetingOut, ReferralRequest, MeetingApplicationOut
from app.schemas.gist import GistOut
from app.schemas.document import DocumentManualReviewRequest, DocumentOut, DocumentVerificationOut
from app.services.application_service import ApplicationService
from app.services.payment_service import PaymentService
from app.services.eds_service import EDSService
from app.services.meeting_service import MeetingService
from app.services.gist_service import GistService
from app.services.document_service import DocumentService
from app.services.naas_service import NaaSService

router = APIRouter(prefix="/scrutiny", tags=["Scrutiny"])


# ──── Dashboard ────


@router.get("/applications", response_model=list[ApplicationOut])
async def list_applications(
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    if status:
        statuses = [ApplicationStatus(s.strip()) for s in status.split("|")]
    else:
        statuses = [
            ApplicationStatus.SUBMITTED,
            ApplicationStatus.UNDER_SCRUTINY,
            ApplicationStatus.EDS,
            ApplicationStatus.REFERRED,
        ]
    return await ApplicationService.list_by_statuses(db, statuses)


@router.get("/applications/{app_id}", response_model=ApplicationOut)
async def get_application(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    return await ApplicationService.get_by_id(db, app_id)


@router.get("/applications/{app_id}/documents", response_model=list[DocumentOut])
async def list_application_documents(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    return await DocumentService.list_for_application(db, app_id)


@router.get("/applications/{app_id}/documents/{doc_id}/verification", response_model=DocumentVerificationOut)
async def get_application_document_verification(
    app_id: UUID,
    doc_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    return await DocumentService.get_verification_for_application_document(db, app_id, doc_id)


@router.post("/applications/{app_id}/documents/{doc_id}/review", response_model=DocumentVerificationOut)
async def review_application_document(
    app_id: UUID,
    doc_id: int,
    data: DocumentManualReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    try:
        verification = await DocumentService.review_document(
            db=db,
            app_id=app_id,
            doc_id=doc_id,
            actor_id=current_user.id,
            actor_role="SCRUTINY",
            decision=data.decision,
            notes=data.notes,
        )
        await db.commit()
        return verification
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))


@router.get("/applications/{app_id}/payment", response_model=Optional[PaymentOut])
async def get_payment(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    payment = await PaymentService.get_for_application(db, app_id)
    return payment


# ──── Accept (SUBMITTED → UNDER_SCRUTINY) ────


@router.post("/applications/{app_id}/accept", response_model=ApplicationOut)
async def accept_application(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    from app.core.workflow import transition_status
    app = await ApplicationService.get_by_id(db, app_id)
    app = await transition_status(
        db, app, ApplicationStatus.UNDER_SCRUTINY, str(current_user.id), "SCRUTINY", "Accepted for scrutiny"
    )
    await db.commit()
    return await ApplicationService.get_by_id(db, app_id)


# ──── Payment Verification ────


@router.post("/applications/{app_id}/payment/verify", response_model=PaymentOut)
async def verify_payment(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    payment = await PaymentService.verify_payment(db, app_id, current_user.id)
    await db.commit()
    await db.refresh(payment)
    await NaaSService.emit_event(
        "PAYMENT_VERIFIED",
        {
            "application_id": str(app_id),
            "payment_id": payment.id,
            "payment_status": payment.status,
            "transaction_ref": payment.transaction_ref,
            "actor_id": str(current_user.id),
            "actor_role": "SCRUTINY",
        },
    )
    return payment


@router.post("/applications/{app_id}/payment/simulate", response_model=PaymentOut)
async def simulate_payment(
    app_id: UUID,
    data: PaymentSimulateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    existing = await PaymentService.get_for_application(db, app_id)
    if existing:
        return existing

    payment = await PaymentService.simulate_payment(db, app_id, data.amount)
    await db.commit()
    await db.refresh(payment)
    return payment


# ──── EDS ────


@router.post("/applications/{app_id}/eds", response_model=EDSRequestOut)
async def raise_eds(
    app_id: UUID,
    data: EDSRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    eds = await EDSService.raise_eds(
        db, app_id, current_user.id,
        general_comments=data.general_comments,
        issues=[issue.model_dump() for issue in data.issues],
    )
    await db.commit()
    await NaaSService.emit_event(
        "EDS_RAISED",
        {
            "application_id": str(app_id),
            "eds_id": eds.id,
            "general_comments": data.general_comments,
            "issues_count": len(data.issues),
            "actor_id": str(current_user.id),
            "actor_role": "SCRUTINY",
        },
    )
    return eds


# ──── Meetings & Referrals ────


@router.get("/meetings", response_model=list[MeetingOut])
async def list_meetings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    return await MeetingService.list_meetings(db)


@router.post("/meetings", response_model=MeetingOut)
async def create_meeting(
    data: MeetingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    meeting = await MeetingService.create_meeting(db, data.model_dump(), current_user.id)
    await db.commit()
    return meeting


@router.post("/applications/{app_id}/refer", response_model=MeetingApplicationOut)
async def refer_application(
    app_id: UUID,
    data: ReferralRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    referral = await MeetingService.refer_application(
        db, app_id, data.meeting_id, current_user.id, data.referral_notes,
    )
    await db.commit()
    await NaaSService.emit_event(
        "APPLICATION_REFERRED_TO_MEETING",
        {
            "application_id": str(app_id),
            "meeting_id": data.meeting_id,
            "referral_notes": data.referral_notes,
            "actor_id": str(current_user.id),
            "actor_role": "SCRUTINY",
        },
    )
    return referral


# ──── Auto‑Gist ────


@router.post("/applications/{app_id}/gist/generate", response_model=GistOut)
async def generate_gist(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    gist = await GistService.generate_gist(db, app_id, current_user.id)
    await db.commit()
    return gist


@router.get("/applications/{app_id}/gist", response_model=GistOut)
async def get_gist(
    app_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY")),
):
    gist = await GistService.get_for_application(db, app_id)
    if not gist:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Gist")
    return gist
