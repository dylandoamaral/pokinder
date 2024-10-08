from uuid import UUID

from pydantic import BaseModel


class ReferenceInsert(BaseModel):
    reference_name: str
    reference_source: str
    reference_family_id: UUID
