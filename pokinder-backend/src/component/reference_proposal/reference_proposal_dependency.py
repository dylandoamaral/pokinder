from typing import Optional, Protocol, runtime_checkable
from uuid import UUID

from .reference_proposal_model import (
    ReferenceProposalAccept,
    ReferenceProposalAdd,
    ReferenceProposalRefuse,
)
from .reference_proposal_table import ReferenceProposal


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

    async def refuse(
        self,
        judge_id: UUID,
        data: ReferenceProposalRefuse,
    ) -> None:
        pass

    async def accept(
        self,
        judge_id: UUID,
        data: ReferenceProposalAccept,
    ) -> None:
        pass
