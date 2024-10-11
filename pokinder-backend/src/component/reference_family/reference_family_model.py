from pydantic import BaseModel


class ReferenceFamilyInsert(BaseModel):
    reference_family_name: str
