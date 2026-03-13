from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.document import ApplicationDocument
from app.core.exceptions import NotFoundException


class DocumentService:

    @staticmethod
    async def upload(db: AsyncSession, app_id: UUID, name: str,
                     file_path: str, mime_type: str | None, uploaded_by: UUID) -> ApplicationDocument:
        doc = ApplicationDocument(
            application_id=app_id,
            name=name,
            file_path=file_path,
            mime_type=mime_type,
            uploaded_by=uploaded_by,
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
