from pydantic import BaseModel


class EDSStandardPointOut(BaseModel):
    id: int
    code: str
    label: str
    category: str
    display_order: int

    class Config:
        from_attributes = True
