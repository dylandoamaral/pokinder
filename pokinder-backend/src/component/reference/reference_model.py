from pydantic import BaseModel
from uuid import UUID


class ReferenceInsert(BaseModel):
    reference_name: str
    reference_source: str
    reference_family_id: UUID
