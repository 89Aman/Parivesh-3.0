from pydantic import BaseModel


class PPUndertakingOut(BaseModel):
    id: int
    code: str
    label: str
    mineral_type: str
    display_order: int

    class Config:
        from_attributes = True
