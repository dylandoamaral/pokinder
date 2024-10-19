from pydantic import BaseModel, field_validator


class ReferenceFamilyInsert(BaseModel):
    reference_family_name: str

    @field_validator("reference_family_name", mode="before")
    def trim_strings(cls, value):
        return value.strip()
