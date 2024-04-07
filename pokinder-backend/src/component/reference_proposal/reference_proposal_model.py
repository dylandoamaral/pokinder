from uuid import UUID

from pydantic import BaseModel


class ReferenceProposalAdd(BaseModel):
    fusions_id: UUID
    reference_name: str
    reference_source: str
    reference_family_name: str
