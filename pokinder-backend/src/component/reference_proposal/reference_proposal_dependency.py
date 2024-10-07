from typing import Protocol, runtime_checkable, Optional
from uuid import UUID

from .reference_proposal_table import ReferenceProposal
from .reference_proposal_model import ReferenceProposalAdd, ReferenceProposalRefuse


@runtime_checkable
class ReferenceProposalDependency(Protocol):
    async def list(
        self,
        account_id: UUID,
        limit: int,
        offset: int = 0,
    ) -> list[ReferenceProposal]:
        pass

    async def post(
        self,
        proposer_id: UUID,
        data: ReferenceProposalAdd,
    ) -> ReferenceProposal:
        pass

    async def modify(
        self,
        proposal_id: UUID,
        maybe_reference_name: Optional[str],
        maybe_reference_source: Optional[str],
        maybe_reference_family_name: Optional[str],
    ) -> None:
        pass

    async def refuse(
        self,
        judge_id: UUID,
        data: ReferenceProposalRefuse,
    ) -> None:
        pass
