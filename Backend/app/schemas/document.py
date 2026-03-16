from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class DocumentOut(BaseModel):
    id: int
    application_id: UUID
    name: str
    file_path: str
    mime_type: Optional[str] = None
    uploaded_by: UUID
    uploaded_at: datetime
    is_verified: bool = False

    class Config:
        from_attributes = True


class DocumentCreate(BaseModel):
    name: str
    file_path: str
    mime_type: Optional[str] = None


class DocumentVerificationChecksOut(BaseModel):
    integrity: str
    mime_type: str
    size_limit: str
    hash: str
    duplicate_hash: str
    issuer_validation: str


class DocumentManualReviewOut(BaseModel):
    decision: str
    notes: Optional[str] = None
    actor_id: Optional[str] = None
    actor_role: Optional[str] = None
    created_at: Optional[str] = None


class DocumentManualReviewRequest(BaseModel):
    decision: str
    notes: Optional[str] = None


class DocumentVerificationOut(BaseModel):
    document_id: int
    status: str
    lifecycle_state: str
    risk_score: float
    confidence_score: float = 0.0
    required_confidence: float = 0.0
    document_profile: str = "GENERIC"
    hash_sha256: Optional[str] = None
    file_size_bytes: int
    duplicate_hash_count: int = 0
    extracted_fields: dict[str, str] = {}
    mismatches: list[str] = []
    manual_review: Optional[DocumentManualReviewOut] = None
    checks: DocumentVerificationChecksOut
