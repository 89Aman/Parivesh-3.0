import base64
import hashlib
import asyncio
import json
import re
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.application import Application
from app.models.audit import AuditLog
from app.models.document import ApplicationDocument
from app.core.db import AsyncSessionLocal
from app.core.exceptions import NotFoundException
from app.services.audit_service import AuditService


class DocumentService:

    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
    ALLOWED_MIME_TYPES = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
        "image/png",
    }
    MANUAL_REVIEW_ACTION = "DOCUMENT_VERIFICATION_REVIEW"
    _verification_cache: dict[str, dict] = {}
    _verification_tasks: dict[str, asyncio.Task] = {}
    PROFILE_CONFIDENCE_THRESHOLDS = {
        "PAN": 0.72,
        "AADHAAR": 0.78,
        "GST": 0.76,
        "LAND_RECORD": 0.68,
        "BANK_STATEMENT": 0.7,
        "GENERIC": 0.65,
    }
    ISSUER_PATTERNS = {
        "PAN": [re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b")],
        "AADHAAR": [re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b")],
        "GST": [re.compile(r"\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[Zz][A-Z0-9]\b")],
        "LAND_RECORD": [
            re.compile(r"\bkhata\b", re.IGNORECASE),
            re.compile(r"\bkhasra\b", re.IGNORECASE),
            re.compile(r"\bsurvey\b", re.IGNORECASE),
        ],
        "BANK_STATEMENT": [
            re.compile(r"\bstatement\b", re.IGNORECASE),
            re.compile(r"\baccount\b", re.IGNORECASE),
            re.compile(r"\bifsc\b", re.IGNORECASE),
        ],
    }

    @staticmethod
    def _cache_key(app_id: UUID, doc_id: int) -> str:
        return f"{app_id}:{doc_id}"

    @staticmethod
    def _status_to_lifecycle_state(status: str) -> str:
        mapping = {
            "pending": "Uploaded",
            "verifying": "Verifying",
            "verified": "Verified",
            "review_required": "Review Required",
            "rejected": "Rejected",
        }
        return mapping.get(status, "Verifying")

    @staticmethod
    def _extract_mime_from_data_url(file_path: str) -> str | None:
        if not file_path or not file_path.startswith("data:") or "," not in file_path:
            return None

        header = file_path.split(",", 1)[0]
        # Expected format: data:<mime>;base64
        mime = header.replace("data:", "", 1).split(";", 1)[0].strip().lower()
        return mime or None

    @staticmethod
    def _extract_file_bytes(file_path: str) -> bytes:
        if not file_path:
            return b""

        if file_path.startswith("data:") and "," in file_path:
            _, payload = file_path.split(",", 1)
            try:
                return base64.b64decode(payload, validate=True)
            except Exception:
                return b""

        # If file_path is not a data URL (for example storage URL),
        # we cannot inspect bytes in this synchronous verification stage.
        return b""

    @staticmethod
    def _extract_text_from_payload(file_bytes: bytes, mime_type: str) -> str:
        if not file_bytes:
            return ""

        if mime_type.startswith("text/"):
            return file_bytes.decode("utf-8", errors="ignore")

        # For phase-2 baseline, attempt best-effort decoding for searchable docs.
        return file_bytes.decode("utf-8", errors="ignore")

    @staticmethod
    def _extract_candidate_fields(name: str, text: str) -> dict[str, str]:
        extracted: dict[str, str] = {}
        blob = f"{name}\n{text}"

        date_match = re.search(r"\b(\d{2}[/-]\d{2}[/-]\d{4})\b", blob)
        if date_match:
            extracted["date"] = date_match.group(1)

        doc_no_match = re.search(r"\b([A-Z]{2,6}[-_/]?[0-9]{4,12})\b", blob)
        if doc_no_match:
            extracted["document_number"] = doc_no_match.group(1)

        if name:
            extracted["filename"] = name

        return extracted

    @staticmethod
    def _detect_document_profile(name: str, text: str) -> str:
        blob = f"{name}\n{text}".lower()
        if any(token in blob for token in ["pan", "income tax"]):
            return "PAN"
        if any(token in blob for token in ["aadhaar", "uidai", "aadhar"]):
            return "AADHAAR"
        if any(token in blob for token in ["gst", "goods and services tax"]):
            return "GST"
        if any(token in blob for token in ["khata", "khasra", "survey", "land record"]):
            return "LAND_RECORD"
        if any(token in blob for token in ["bank", "statement", "ifsc"]):
            return "BANK_STATEMENT"
        return "GENERIC"

    @staticmethod
    def _validate_issuer(profile: str, text: str, name: str) -> str:
        if profile == "GENERIC":
            return "review_required"

        patterns = DocumentService.ISSUER_PATTERNS.get(profile, [])
        if not patterns:
            return "review_required"

        blob = f"{name}\n{text}"
        matched = any(pattern.search(blob) for pattern in patterns)
        return "passed" if matched else "failed"

    @staticmethod
    def _detect_mismatches(application: Application | None, text: str) -> list[str]:
        if not application:
            return []

        blob = (text or "").lower()
        mismatches: list[str] = []

        if application.project_name and blob and application.project_name.lower() not in blob:
            mismatches.append("Project name not found in extracted content")

        if application.state and blob and application.state.lower() not in blob:
            mismatches.append("Application state not found in extracted content")

        if application.district and blob and application.district.lower() not in blob:
            mismatches.append("Application district not found in extracted content")

        return mismatches

    @staticmethod
    def _compute_confidence(
        profile: str,
        verification: dict,
        mismatches: list[str],
        duplicate_hash_count: int,
    ) -> float:
        score = 0.45
        checks = verification.get("checks", {})

        if checks.get("integrity") == "passed":
            score += 0.2
        if checks.get("mime_type") == "passed":
            score += 0.1
        if checks.get("hash") in {"passed", "skipped"}:
            score += 0.08
        if checks.get("issuer_validation") == "passed":
            score += 0.17
        if checks.get("issuer_validation") == "failed":
            score -= 0.2

        extracted_fields = verification.get("extracted_fields", {})
        score += min(0.08, len(extracted_fields) * 0.02)

        if duplicate_hash_count > 0:
            score -= min(0.2, duplicate_hash_count * 0.05)
        if mismatches:
            score -= min(0.25, len(mismatches) * 0.07)

        if profile in {"PAN", "AADHAAR", "GST"}:
            score -= 0.03

        return round(max(0.0, min(1.0, score)), 2)

    @staticmethod
    async def _count_duplicate_hashes(
        db: AsyncSession, hash_sha256: str | None, current_doc_id: int
    ) -> int:
        if not hash_sha256:
            return 0

        result = await db.execute(select(ApplicationDocument))
        docs = result.scalars().all()

        duplicate_count = 0
        for doc in docs:
            if doc.id == current_doc_id:
                continue
            comparison_hash = DocumentService.verify_payload(doc.name, doc.file_path, doc.mime_type).get("hash_sha256")
            if comparison_hash and comparison_hash == hash_sha256:
                duplicate_count += 1

        return duplicate_count

    @staticmethod
    async def _get_latest_manual_review(
        db: AsyncSession,
        app_id: UUID,
        doc_id: int,
    ) -> dict | None:
        entity_id = f"{app_id}:{doc_id}"
        result = await db.execute(
            select(AuditLog)
            .filter(
                AuditLog.entity_type == "DOCUMENT_VERIFICATION",
                AuditLog.entity_id == entity_id,
                AuditLog.action == DocumentService.MANUAL_REVIEW_ACTION,
            )
            .order_by(AuditLog.created_at.desc())
        )
        log = result.scalars().first()
        if not log:
            return None

        parsed: dict = {}
        try:
            parsed = json.loads(log.description)
        except Exception:
            parsed = {"notes": log.description}

        actor_role = None
        if log.actor_role is not None:
            actor_role = getattr(log.actor_role, "value", str(log.actor_role))

        return {
            "decision": parsed.get("decision", "review_required"),
            "notes": parsed.get("notes"),
            "actor_id": str(log.actor_id) if log.actor_id else None,
            "actor_role": actor_role,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }

    @staticmethod
    def verify_payload(name: str, file_path: str, mime_type: str | None) -> dict:
        file_bytes = DocumentService._extract_file_bytes(file_path)
        file_size = len(file_bytes)
        hash_sha256 = hashlib.sha256(file_bytes).hexdigest() if file_bytes else None

        inferred_mime = (
            (mime_type or "").strip().lower()
            or DocumentService._extract_mime_from_data_url(file_path)
            or ""
        )
        mime_ok = inferred_mime in DocumentService.ALLOWED_MIME_TYPES
        text_content = DocumentService._extract_text_from_payload(file_bytes, inferred_mime)
        document_profile = DocumentService._detect_document_profile(name, text_content)
        issuer_validation = DocumentService._validate_issuer(document_profile, text_content, name)

        has_embedded_bytes = bool(file_bytes)
        integrity_ok = has_embedded_bytes
        size_ok = file_size > 0 and file_size <= DocumentService.MAX_FILE_SIZE_BYTES if has_embedded_bytes else True
        hash_ok = bool(hash_sha256) if has_embedded_bytes else True

        if not has_embedded_bytes:
            # External storage URLs cannot be verified byte-level here.
            status = "review_required"
            risk_score = 0.5 if not mime_ok else 0.35
            integrity_state = "skipped"
            size_state = "skipped"
            hash_state = "skipped"
        else:
            failed_checks = sum([not integrity_ok, not mime_ok, not size_ok, not hash_ok])
            risk_score = round(min(1.0, failed_checks / 4), 2)

            if failed_checks == 0:
                status = "verified"
            elif failed_checks <= 2:
                status = "review_required"
            else:
                status = "rejected"

            integrity_state = "passed" if integrity_ok else "failed"
            size_state = "passed" if size_ok else "failed"
            hash_state = "passed" if hash_ok else "failed"

        return {
            "status": status,
            "risk_score": risk_score,
            "confidence_score": 0.0,
            "required_confidence": DocumentService.PROFILE_CONFIDENCE_THRESHOLDS.get(document_profile, 0.65),
            "document_profile": document_profile,
            "hash_sha256": hash_sha256,
            "file_size_bytes": file_size,
            "text_content": text_content,
            "extracted_fields": DocumentService._extract_candidate_fields(name, text_content),
            "checks": {
                "integrity": integrity_state,
                "mime_type": "passed" if mime_ok else "failed",
                "size_limit": size_state,
                "hash": hash_state,
                "duplicate_hash": "passed",
                "issuer_validation": issuer_validation,
            },
            "name": name,
            "mime_type": inferred_mime,
        }

    @staticmethod
    async def _compute_verification(db: AsyncSession, app_id: UUID, doc_id: int) -> dict:
        result = await db.execute(
            select(ApplicationDocument).filter(
                ApplicationDocument.id == doc_id,
                ApplicationDocument.application_id == app_id,
            )
        )
        doc = result.scalars().first()
        if not doc:
            raise NotFoundException("Document")

        verification = DocumentService.verify_payload(doc.name, doc.file_path, doc.mime_type)
        hash_sha256 = verification.get("hash_sha256")
        duplicate_hash_count = await DocumentService._count_duplicate_hashes(db, hash_sha256, doc.id)
        verification["duplicate_hash_count"] = duplicate_hash_count
        verification["checks"]["duplicate_hash"] = "failed" if duplicate_hash_count > 0 else "passed"

        app_result = await db.execute(select(Application).filter(Application.id == app_id))
        application = app_result.scalars().first()
        text_content = verification.get("text_content", "")
        mismatches = DocumentService._detect_mismatches(application, text_content)
        verification["mismatches"] = mismatches

        confidence_score = DocumentService._compute_confidence(
            verification.get("document_profile", "GENERIC"),
            verification,
            mismatches,
            duplicate_hash_count,
        )
        required_confidence = float(verification.get("required_confidence", 0.65))
        verification["confidence_score"] = confidence_score
        verification["required_confidence"] = required_confidence

        risk_score = float(verification.get("risk_score", 0.0))
        if duplicate_hash_count > 0:
            risk_score = min(1.0, risk_score + 0.2)
        if mismatches:
            risk_score = min(1.0, risk_score + min(0.3, 0.1 * len(mismatches)))
        if confidence_score < required_confidence:
            risk_score = min(1.0, risk_score + min(0.25, required_confidence - confidence_score))

        status = verification.get("status", "review_required")
        if risk_score >= 0.75 or confidence_score < (required_confidence * 0.6):
            status = "rejected"
        elif risk_score >= 0.35 or confidence_score < required_confidence:
            status = "review_required"
        else:
            status = "verified"

        manual_review = await DocumentService._get_latest_manual_review(db, app_id, doc_id)
        if manual_review:
            status = manual_review["decision"]

        verification["status"] = status
        verification["lifecycle_state"] = DocumentService._status_to_lifecycle_state(status)
        verification["manual_review"] = manual_review
        verification["risk_score"] = round(risk_score, 2)
        verification.pop("text_content", None)
        verification["document_id"] = doc.id

        return verification

    @staticmethod
    async def _run_verification_job(app_id: UUID, doc_id: int) -> None:
        key = DocumentService._cache_key(app_id, doc_id)
        try:
            async with AsyncSessionLocal() as db:
                verification = await DocumentService._compute_verification(db, app_id, doc_id)
                DocumentService._verification_cache[key] = verification
        except Exception:
            fallback = DocumentService._verification_cache.get(key, {})
            fallback.update(
                {
                    "document_id": doc_id,
                    "status": "review_required",
                    "lifecycle_state": "Review Required",
                    "risk_score": 0.8,
                }
            )
            DocumentService._verification_cache[key] = fallback
        finally:
            DocumentService._verification_tasks.pop(key, None)

    @staticmethod
    def enqueue_verification(app_id: UUID, doc_id: int) -> None:
        key = DocumentService._cache_key(app_id, doc_id)
        running = DocumentService._verification_tasks.get(key)
        if running and not running.done():
            return

        DocumentService._verification_cache[key] = {
            "document_id": doc_id,
            "status": "verifying",
            "lifecycle_state": "Verifying",
            "risk_score": 0.0,
            "confidence_score": 0.0,
            "required_confidence": 0.0,
            "document_profile": "GENERIC",
            "hash_sha256": None,
            "file_size_bytes": 0,
            "duplicate_hash_count": 0,
            "extracted_fields": {},
            "mismatches": [],
            "manual_review": None,
            "checks": {
                "integrity": "pending",
                "mime_type": "pending",
                "size_limit": "pending",
                "hash": "pending",
                "duplicate_hash": "pending",
                "issuer_validation": "pending",
            },
        }

        DocumentService._verification_tasks[key] = asyncio.create_task(
            DocumentService._run_verification_job(app_id, doc_id)
        )

    @staticmethod
    async def upload(db: AsyncSession, app_id: UUID, name: str,
                     file_path: str, mime_type: str | None, uploaded_by: UUID,
                     is_verified: bool = False) -> ApplicationDocument:
        doc = ApplicationDocument(
            application_id=app_id,
            name=name,
            file_path=file_path,
            mime_type=mime_type,
            uploaded_by=uploaded_by,
            is_verified=is_verified,
        )
        db.add(doc)
        await db.flush()
        await db.refresh(doc)
        return doc

    @staticmethod
    async def list_for_application(db: AsyncSession, app_id: UUID) -> list[ApplicationDocument]:
        result = await db.execute(
            select(ApplicationDocument).filter(ApplicationDocument.application_id == app_id)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, doc_id: int) -> ApplicationDocument:
        result = await db.execute(
            select(ApplicationDocument).filter(ApplicationDocument.id == doc_id)
        )
        doc = result.scalars().first()
        if not doc:
            raise NotFoundException("Document")
        return doc

    @staticmethod
    async def get_verification_for_application_document(
        db: AsyncSession, app_id: UUID, doc_id: int
    ) -> dict:
        key = DocumentService._cache_key(app_id, doc_id)
        cached = DocumentService._verification_cache.get(key)
        if cached is not None:
            return cached

        DocumentService.enqueue_verification(app_id, doc_id)
        return DocumentService._verification_cache[key]

    @staticmethod
    async def review_document(
        db: AsyncSession,
        app_id: UUID,
        doc_id: int,
        actor_id: UUID,
        actor_role: str,
        decision: str,
        notes: str | None,
    ) -> dict:
        normalized = (decision or "").strip().lower()
        if normalized not in {"verified", "review_required", "rejected"}:
            raise ValueError("decision must be one of: verified, review_required, rejected")

        result = await db.execute(
            select(ApplicationDocument).filter(
                ApplicationDocument.id == doc_id,
                ApplicationDocument.application_id == app_id,
            )
        )
        doc = result.scalars().first()
        if not doc:
            raise NotFoundException("Document")

        doc.is_verified = normalized == "verified"
        db.add(doc)

        await AuditService.log_action(
            db=db,
            actor_id=actor_id,
            actor_role=actor_role,
            action=DocumentService.MANUAL_REVIEW_ACTION,
            description=json.dumps({"decision": normalized, "notes": notes or ""}),
            entity_type="DOCUMENT_VERIFICATION",
            entity_id=f"{app_id}:{doc_id}",
        )

        await db.flush()
        verification = await DocumentService._compute_verification(db, app_id, doc_id)
        DocumentService._verification_cache[DocumentService._cache_key(app_id, doc_id)] = verification
        return verification
