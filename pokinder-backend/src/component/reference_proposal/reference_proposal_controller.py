from typing import Optional
from uuid import UUID

from litestar import Controller, get, post

from src.security import Request

from .reference_proposal_dependency import ReferenceProposalDependency
from .reference_proposal_dto import DTO, ReturnDTO
from .reference_proposal_model import (
    ReferenceProposalAccept,
    ReferenceProposalAdd,
    ReferenceProposalRefuse,
)
from .reference_proposal_table import ReferenceProposal


class ReferenceProposalController(Controller):
    dto = DTO
    return_dto = ReturnDTO
    path = "/reference_proposal"

    @get(path="/")
    async def list_reference_pruposals(
        self,
        request: Request,
        reference_proposal_dependency: ReferenceProposalDependency,
        limit: int,
        offset: int = 0,
    ) -> list[ReferenceProposal]:
        return await reference_proposal_dependency.list(
            request.user.id,
            limit,
            offset,
        )

    @post(path="/", dto=None)
    async def post_reference_pruposal(
        self,
        request: Request,
        reference_proposal_dependency: ReferenceProposalDependency,
        data: ReferenceProposalAdd,
    ) -> ReferenceProposal:
        return await reference_proposal_dependency.post(
            request.user.id,
            data,
        )

    @post(path="/modify")
    async def modify_reference_pruposal(
        self,
        reference_proposal_dependency: ReferenceProposalDependency,
        proposal_id: UUID,
        maybe_reference_name: Optional[str],
        maybe_reference_source: Optional[str],
        maybe_reference_family_name: Optional[str],
    ) -> None:
        return await reference_proposal_dependency.modify(
            proposal_id,
            maybe_reference_name,
            maybe_reference_source,
            maybe_reference_family_name,
        )

    @post(path="/refuse", dto=None)
    async def refuse_reference_pruposal(
        self,
        request: Request,
        reference_proposal_dependency: ReferenceProposalDependency,
        data: ReferenceProposalRefuse,
    ) -> None:
        return await reference_proposal_dependency.refuse(request.user.id, data)

    @post(path="/accept", dto=None)
    async def accept(
        self,
        request: Request,
        reference_proposal_dependency: ReferenceProposalDependency,
        data: ReferenceProposalAccept,
    ) -> None:
        return await reference_proposal_dependency.accept(request.user.id, data)
