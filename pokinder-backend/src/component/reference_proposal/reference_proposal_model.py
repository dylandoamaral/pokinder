from uuid import UUID

from pydantic import BaseModel, field_validator


class ReferenceProposalAdd(BaseModel):
    fusions_id: UUID
    reference_name: str
    reference_family_name: str

    @field_validator("reference_name", "reference_family_name", mode="before")
    def trim_strings(cls, value):
        return value.strip()


class ReferenceProposalRefuse(BaseModel):
    reference_proposal_id: UUID
    reason: str

    @field_validator("reason", mode="before")
    def trim_strings(cls, value):
        return value.strip()


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

    @field_validator("reference_name", "reference_source", mode="before")
    def trim_strings(cls, value):
        return value.strip()


class ReferenceProposalAcceptReferenceFamily(BaseModel):
    reference_proposal_id: UUID
    reference_family_name: str
    reference_name: str
    reference_source: str
    fusion_id: UUID

    @field_validator("reference_family_name", "reference_name", "reference_source", mode="before")
    def trim_strings(cls, value):
        return value.strip()
