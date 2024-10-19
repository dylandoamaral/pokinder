from uuid import UUID

from pydantic import BaseModel


class ReferenceProposalAdd(BaseModel):
    fusions_id: UUID
    reference_name: str
    reference_family_name: str


class ReferenceProposalRefuse(BaseModel):
    reference_proposal_id: UUID
    reason: str


class ReferenceProposalAccept(BaseModel):
    reference_proposal_id: UUID
    reference_id: UUID
    fusion_id: UUID


class ReferenceProposalAcceptReference(BaseModel):
    reference_proposal_id: UUID
    reference_family_id: UUID
    reference_name: str
    reference_source: str
    fusion_id: UUID


class ReferenceProposalAcceptReferenceFamily(BaseModel):
    reference_proposal_id: UUID
    reference_family_name: str
    reference_name: str
    reference_source: str
    fusion_id: UUID
