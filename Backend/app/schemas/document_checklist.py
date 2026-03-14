from pydantic import BaseModel


class DocumentChecklistItemOut(BaseModel):
    s_no: int
    document_required: str
    remarks: str = ""


class DocumentChecklistOut(BaseModel):
    category: str
    items: list[DocumentChecklistItemOut]
