from uuid import UUID

from pydantic import BaseModel, field_validator


class ReferenceInsert(BaseModel):
    reference_name: str
    reference_source: str
    reference_family_id: UUID

    @field_validator("reference_name", "reference_source", mode="before")
    def trim_strings(cls, value):
        return value.strip()
