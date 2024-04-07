from typing import Protocol, runtime_checkable, Optional
from uuid import UUID

from .reference_proposal_table import ReferenceProposal, ReferenceProposalChoice
from .reference_proposal_model import ReferenceProposalAdd


@runtime_checkable
class ReferenceProposalDependency(Protocol):
    async def list(self) -> list[ReferenceProposal]:
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

    async def judge(
        self,
        judge_id: UUID,
        proposal_id: UUID,
        proposal_choice: ReferenceProposalChoice,
    ) -> None:
        pass
