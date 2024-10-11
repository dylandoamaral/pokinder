from typing import Optional
from uuid import UUID

from litestar import Controller, get, post

from src.security import Request
from src.security.guard import admin_only

from .reference_proposal_dependency import ReferenceProposalDependency
from .reference_proposal_dto import DTO, ReturnDTO, ReturnDTOList
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

    @get(path="/", return_dto=ReturnDTOList)
    async def list_reference_pruposals(
        self,
        reference_proposal_dependency: ReferenceProposalDependency,
        limit: int,
        offset: int = 0,
    ) -> list[ReferenceProposal]:
        return await reference_proposal_dependency.list(
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

    @post(path="/refuse", dto=None, guards=[admin_only])
    async def refuse_reference_pruposal(
        self,
        request: Request,
        reference_proposal_dependency: ReferenceProposalDependency,
        data: ReferenceProposalRefuse,
    ) -> None:
        return await reference_proposal_dependency.refuse(request.user.id, data)

    @post(path="/accept", dto=None, guards=[admin_only])
    async def accept(
        self,
        request: Request,
        reference_proposal_dependency: ReferenceProposalDependency,
        data: ReferenceProposalAccept,
    ) -> None:
        return await reference_proposal_dependency.accept(request.user.id, data)
