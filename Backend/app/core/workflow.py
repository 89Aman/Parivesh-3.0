"""
Workflow Engine (FSM) — centralized status transitions.

Valid transitions:
 DRAFT          → SUBMITTED         (by PP)
 SUBMITTED      → UNDER_SCRUTINY    (system / Scrutiny opens)
 UNDER_SCRUTINY → EDS               (Scrutiny raises EDS)
 EDS            → UNDER_SCRUTINY    (PP resolves EDS)
 UNDER_SCRUTINY → REFERRED          (Scrutiny, after docs + payment verified)
 REFERRED       → MOM_GENERATED     (Scrutiny generates Gist)
 MOM_GENERATED  → FINALIZED         (MoM finalizes)
"""

import uuid as _uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus, ApplicationStatusHistory
from app.models.audit import AuditLog


TRANSITIONS: dict[ApplicationStatus, dict[ApplicationStatus, list[str]]] = {
    ApplicationStatus.DRAFT: {
        ApplicationStatus.SUBMITTED: ["PP", "RQP"],
    },
    ApplicationStatus.SUBMITTED: {
        ApplicationStatus.UNDER_SCRUTINY: ["SCRUTINY", "ADMIN"],
    },
    ApplicationStatus.UNDER_SCRUTINY: {
        ApplicationStatus.EDS: ["SCRUTINY"],
        ApplicationStatus.REFERRED: ["SCRUTINY"],
    },
    ApplicationStatus.EDS: {
        ApplicationStatus.UNDER_SCRUTINY: ["PP", "RQP"],
    },
    ApplicationStatus.REFERRED: {
        ApplicationStatus.MOM_GENERATED: ["SCRUTINY"],
    },
    ApplicationStatus.MOM_GENERATED: {
        ApplicationStatus.FINALIZED: ["MOM"],
    },
}


async def transition_status(
    db: AsyncSession,
    application: Application,
    target_status: ApplicationStatus,
    actor_id: str,
    actor_role: str,
    reason: str | None = None,
) -> Application:
    """
    Validate and execute a status transition on the given application.
    Writes status history + audit log.
    """
    current = application.status
    current_val = current.value if hasattr(current, "value") else current
    target_val = target_status.value if hasattr(target_status, "value") else target_status

    allowed_targets = TRANSITIONS.get(current, {})
    # Also check by value if Enum lookup failed
    if not allowed_targets and hasattr(current, "value"):
         allowed_targets = TRANSITIONS.get(current, {}) # Should work
    
    # Simple lookup by value in TRANSITIONS if needed, but TRANSITIONS keys are ApplicationStatus
    # Let's ensure current is converted to ApplicationStatus if it's a string
    if isinstance(current, str):
        current = ApplicationStatus(current)
    
    allowed_targets = TRANSITIONS.get(current, {})

    if target_status not in allowed_targets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transition from {current_val} to {target_val} is not allowed.",
        )


    allowed_roles = allowed_targets[target_status]
    if actor_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{actor_role}' cannot perform transition {current_val} → {target_val}.",
        )

    # Ensure IDs are proper UUID objects for UUID columns to avoid comparison errors in SQLite
    def to_uuid(val):
        if val is None: return None
        if isinstance(val, _uuid.UUID): return val
        try:
            return _uuid.UUID(str(val))
        except (ValueError, TypeError):
            return val

    app_uuid = to_uuid(application.id)
    actor_uuid = to_uuid(actor_id)

    # Record history
    history = ApplicationStatusHistory(
        application_id=app_uuid,
        from_status=current_val,
        to_status=target_val,
        changed_by_user_id=actor_uuid,
        changed_by_role=actor_role,
        reason=reason,
    )
    db.add(history)

    # Audit log
    audit = AuditLog(
        actor_id=actor_uuid,
        actor_role=actor_role,
        action="STATUS_CHANGE",
        description=f"{current_val} -> {target_val}",

        entity_type="APPLICATION",
        entity_id=str(application.id),
    )
    db.add(audit)

    # Update application
    application.status = target_status
    db.add(application)

    await db.flush()
    return application
