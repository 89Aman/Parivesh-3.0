"""
AI Scrutiny Assistant — answers questions about an application using Gemini.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.db import get_db
from app.core.rbac import require_role
from app.models.user import User
from app.models.application import Application
from app.models.eds import EDSRequest
from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


class AIAssistRequest(BaseModel):
    question: str


class AIAssistResponse(BaseModel):
    answer: str


def _build_context(app: Application) -> str:
    params_text = ""
    if app.parameters:
        lines = []
        for p in app.parameters:
            val = p.value_text or p.value_number or str(p.value_boolean) or "N/A"
            lines.append(f"  - Param #{p.sector_parameter_id}: {val}")
        params_text = "\n".join(lines)

    docs_text = ""
    if app.documents:
        docs_text = ", ".join(d.document_name for d in app.documents if hasattr(d, "document_name"))

    return f"""
Project Name: {app.project_name}
Category: {app.category}
Sector ID: {app.sector_id}
Status: {app.status}
State: {app.state or 'N/A'}
District: {app.district or 'N/A'}
Project Area (ha): {app.project_area_ha or 'N/A'}
Capacity: {app.capacity or 'N/A'}
Risk Score: {app.risk_score} ({app.risk_level})
EDS Cycles: {app.eds_cycle_count}
Documents: {docs_text or 'None listed'}
Parameters:
{params_text or '  None'}
""".strip()


SYSTEM_PROMPT = """You are a senior environmental officer at MoEFCC helping scrutiny officials
review Environmental Clearance applications. Answer concisely in 2–5 sentences.
Base your answer ONLY on the provided application data. Do not hallucinate.
If the information is not in the context, say "Not available in the application data."
"""


@router.post("/assist/{app_id}", response_model=AIAssistResponse)
async def ai_assist(
    app_id: UUID,
    body: AIAssistRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SCRUTINY", "ADMIN")),
):
    if not settings.GOOGLE_API_KEY:
        raise HTTPException(status_code=503, detail="AI assistant not configured (missing GOOGLE_API_KEY)")

    result = await db.execute(
        select(Application)
        .options(
            selectinload(Application.parameters),
            selectinload(Application.documents),
        )
        .filter(Application.id == app_id)
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    context = _build_context(app)
    prompt = f"{SYSTEM_PROMPT}\n\nAPPLICATION DATA:\n{context}\n\nQUESTION: {body.question}\n\nANSWER:"

    try:
        from google import genai  # type: ignore
        client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        answer = response.text or "No response generated."
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"AI assistant temporarily unavailable: {str(exc)}")

    return AIAssistResponse(answer=answer)
