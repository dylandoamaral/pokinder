from litestar import Controller, get, post
from uuid import UUID
from typing import Optional

from src.security import Request

from .reference_proposal_dependency import ReferenceProposalDependency
from .reference_proposal_table import ReferenceProposal, ReadDTO, PostDTO, WriteDTO
from .reference_proposal_model import ReferenceProposalAdd, ReferenceProposalRefuse


class ReferenceProposalController(Controller):
    dto = WriteDTO
    return_dto = ReadDTO
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

    @post(path="/", dto=None, return_dto=PostDTO)
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
