"""
AI Service — Orchestrates Gemini-powered Gist and MoM generation.

Uses google-genai directly for simple, reliable API calls with the same
system prompts defined in the ADK agent files.
"""
import os
import logging
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models.application import Application, ApplicationParameter, ApplicationStatusHistory
from app.models.eds import EDSRequest
from app.models.payment import Payment, PaymentStatus
from app.models.document import ApplicationDocument

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy-init Gemini client
# ---------------------------------------------------------------------------
_genai_client = None

def _get_genai_client():
    global _genai_client
    if _genai_client is None:
        try:
            from google import genai
        except ImportError as e:
            logger.error("google-genai package is not installed: %s", e)
            raise RuntimeError(
                "AI service dependency missing: install 'google-genai' in the backend environment."
            ) from e

        try:
            api_key = settings.GOOGLE_API_KEY
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not set in environment")
            _genai_client = genai.Client(api_key=api_key)
            logger.info("Gemini client initialised successfully")
        except Exception as e:
            logger.error(f"Failed to init Gemini client: {e}")
            raise
    return _genai_client


# ───────────────────────────────────────────────────────────────────────────
# System prompts  (mirrors the ADK agent descriptions + instructions)
# ───────────────────────────────────────────────────────────────────────────

GIST_SYSTEM_PROMPT = """You are a senior technical officer at the Ministry of Environment, Forest and
Climate Change (MoEFCC), Government of India. You are preparing a formal
Meeting Gist document for the Expert Appraisal Committee (EAC) meeting.

A Meeting Gist is a pre-meeting briefing document that summarizes the project
proposal so committee members can review it before the meeting.

INSTRUCTIONS:
Generate a formal Meeting Gist document in English with the following sections.
Use formal Indian government administrative language throughout.
Only use the data provided — do NOT fabricate, assume, or hallucinate
any values not present in the input.
If a field is missing or marked N/A, skip it or note it as "not provided".

FORMAT YOUR OUTPUT EXACTLY AS FOLLOWS:

---

GOVERNMENT OF INDIA
MINISTRY OF ENVIRONMENT, FOREST AND CLIMATE CHANGE
EXPERT APPRAISAL COMMITTEE (EAC)

MEETING GIST

1. BACKGROUND
Write 2–3 sentences describing the project, proponent, location, and
clearance sought. Reference the category and sector.

2. PROJECT PROPOSAL
Structured summary including:
- Type and scale of activity
- Location and land area
- Key technical parameters
- Capacity or output

3. COMPLIANCE & DOCUMENTATION STATUS
Document submission status, payment status, EDS history.

4. KEY ISSUES FOR COMMITTEE CONSIDERATION
3–6 specific technical/environmental/procedural issues as numbered bullets.

5. RELEVANT ENVIRONMENTAL CONCERNS
Bullet points of likely environmental concerns relevant to this project type.

6. SUGGESTED AGENDA FOR COMMITTEE DISCUSSION
4–5 numbered agenda points.

---
PREPARED BY: Scrutiny Team
STATUS: DRAFT — FOR COMMITTEE REVIEW ONLY
---

Important: Output only the document. No explanations, no preamble,
no markdown code blocks. Plain text, formal government style.
"""

MOM_SYSTEM_PROMPT = """You are a senior officer at MoEFCC, Government of India, responsible for
drafting the official Minutes of Meeting (MoM) after an Expert Appraisal
Committee (EAC) meeting.

INSTRUCTIONS:
Generate a complete, formal Minutes of Meeting (MoM) document.
Use formal Indian government language.
Base the deliberations on the MEETING DISCUSSION NOTES provided.
Base background and project details on the GIST provided.
Do NOT fabricate conditions or decisions not present in the notes.
If meeting notes are sparse, use standard EAC language for that project type.

FORMAT YOUR OUTPUT EXACTLY AS FOLLOWS:

---

GOVERNMENT OF INDIA
MINISTRY OF ENVIRONMENT, FOREST AND CLIMATE CHANGE
MINUTES OF THE MEETING OF THE EXPERT APPRAISAL COMMITTEE (EAC)

1. ATTENDANCE
2. PROJECT BACKGROUND
3. PRESENTATION BY PROPONENT
4. DELIBERATIONS BY THE COMMITTEE (most important — 4–8 numbered points)
5. DECISION OF THE COMMITTEE
6. CONDITIONS / STIPULATIONS
7. ACTION ITEMS (table format: Action | Responsible Party | Timeline)

---
Prepared by: MoM Team Officer
Note: These minutes are subject to confirmation at the next EAC meeting.
---

Important: Output only the document. Plain formatted text only.
"""


class AIService:
    """Orchestrates Gemini-powered content generation for Gist & MoM."""

    # ── helpers ──────────────────────────────────────────────────────────
    @staticmethod
    async def _get_base_application_data(db: AsyncSession, app_id: UUID) -> Application:
        result = await db.execute(
            select(Application)
            .options(
                selectinload(Application.parameters)
                    .selectinload(ApplicationParameter.sector_parameter),
                selectinload(Application.documents),
                selectinload(Application.payment),
                selectinload(Application.sector),
                selectinload(Application.applicant),
            )
            .filter(Application.id == app_id)
        )
        app = result.scalars().first()
        if not app:
            raise Exception(f"Application {app_id} not found")
        return app

    @staticmethod
    async def _call_gemini(system_prompt: str, user_prompt: str) -> str:
        """Call Gemini and return the text response."""
        import asyncio
        client = _get_genai_client()

        # Run in executor so we don't block the event loop
        def _sync_call():
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_prompt,
                config={
                    "system_instruction": system_prompt,
                    "temperature": 0.3,
                    "max_output_tokens": 4096,
                },
            )
            return response.text

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _sync_call)

    # ── Gist generation ─────────────────────────────────────────────────
    @staticmethod
    async def generate_gist(db: AsyncSession, app_id: UUID) -> str:
        app = await AIService._get_base_application_data(db, app_id)

        # Prepare parameters
        params_lines = []
        for p in app.parameters:
            name = p.sector_parameter.name if p.sector_parameter else "Unknown"
            val = p.value_text or p.value_number or p.value_boolean or "N/A"
            params_lines.append(f"- {name}: {val}")
        params_str = "\n".join(params_lines) or "None provided"

        # Prepare documents
        docs_lines = []
        for d in app.documents:
            status = "Verified" if d.is_verified else "Pending"
            docs_lines.append(f"- {d.name}: {status}")
        docs_str = "\n".join(docs_lines) or "No documents uploaded"

        # EDS History
        eds_result = await db.execute(
            select(EDSRequest)
            .options(selectinload(EDSRequest.issues))
            .filter(EDSRequest.application_id == app_id)
            .order_by(EDSRequest.cycle_number.asc())
        )
        eds_history = eds_result.scalars().all()
        eds_lines = []
        for eds in eds_history:
            eds_lines.append(f"Cycle {eds.cycle_number}:")
            for issue in eds.issues:
                eds_lines.append(f"  - {issue.standard_reason}: {issue.comments}")
        eds_str = "\n".join(eds_lines) or "No EDS cycles occurred."

        # Latest scrutiny observation
        history_result = await db.execute(
            select(ApplicationStatusHistory)
            .filter(ApplicationStatusHistory.application_id == app_id)
            .order_by(ApplicationStatusHistory.created_at.desc())
        )
        latest = history_result.scalars().first()
        scrutiny_notes = latest.reason if latest else "No specific observations provided."

        user_prompt = f"""
==== APPLICATION DATA ====
Application ID: {app.id}
Application Category: {app.category}
Industry Sector: {app.sector.name if app.sector else 'N/A'}
Date of Submission: {app.created_at.strftime('%Y-%m-%d')}

==== PROJECT DETAILS ====
Project Name: {app.project_name}
Project Description: {app.project_description or 'N/A'}
Proponent Name: {app.applicant.full_name if app.applicant else 'N/A'}

==== LOCATION ====
State: {app.state or 'N/A'}
District: {app.district or 'N/A'}
Taluk / Block: {app.taluk or 'N/A'}
Village: {app.village or 'N/A'}
Latitude / Longitude: {app.latitude or 'N/A'}, {app.longitude or 'N/A'}
Total Project Area: {app.project_area_ha or 'N/A'} hectares

==== TECHNICAL & SECTOR PARAMETERS ====
{params_str}

==== DOCUMENT CHECKLIST STATUS ====
{docs_str}

==== PAYMENT STATUS ====
Fee Amount: {app.payment.amount if app.payment else '0.00'}
Payment Status: {app.payment.status.value if app.payment else 'PENDING'}
Transaction Reference: {app.payment.transaction_ref if app.payment else 'N/A'}

==== SCRUTINY OFFICER OBSERVATIONS ====
{scrutiny_notes}

==== EDS HISTORY ====
Number of EDS cycles: {app.eds_cycle_count}
EDS Issues Raised:
{eds_str}

Generated Date: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}

Please generate the formal Meeting Gist document now.
"""
        return await AIService._call_gemini(GIST_SYSTEM_PROMPT, user_prompt)

    # ── MoM generation ───────────────────────────────────────────────────
    @staticmethod
    async def generate_mom(
        db: AsyncSession,
        app_id: UUID,
        meeting_notes: str,
        additional_conditions: str = "None",
    ) -> str:
        from app.models.mom_model import Gist

        app = await AIService._get_base_application_data(db, app_id)

        # Get existing Gist content
        gist_result = await db.execute(
            select(Gist).filter(Gist.application_id == app_id)
        )
        gist = gist_result.scalars().first()
        gist_content = gist.content if gist else "Gist not available for this application."

        user_prompt = f"""
==== PRE-MEETING GIST ====
{gist_content}

==== MEETING DETAILS ====
Meeting Date: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}
Meeting Time: 11:00 AM
Committee Name: Expert Appraisal Committee for {app.sector.name if app.sector else 'Industry'}
Meeting Type: Regular Assessment

==== ATTENDEES ====
- Chair: Dr. K. Sharma, Chairperson EAC
- Member Secretary: Shri R. Verma, Director MoEFCC
- Expert Member: Dr. S. Pal, Environmental Scientist

==== ACTUAL MEETING DISCUSSION NOTES ====
{meeting_notes}

==== ADDITIONAL CONDITIONS / DECISIONS NOTED ====
{additional_conditions}

Sector: {app.sector.name if app.sector else 'N/A'}
Generated Date: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}

Please generate the formal Minutes of Meeting document now.
"""
        return await AIService._call_gemini(MOM_SYSTEM_PROMPT, user_prompt)
