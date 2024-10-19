from typing import Optional
from uuid import UUID

from litestar import Controller, get, post

from src.component.reference.reference_dependency import ReferenceDependency
from src.component.reference.reference_model import ReferenceInsert
from src.component.reference_family.reference_family_dependency import (
    ReferenceFamilyDependency,
)
from src.component.reference_family.reference_family_model import ReferenceFamilyInsert
from src.security import Request
from src.security.guard import admin_only

from .reference_proposal_dependency import ReferenceProposalDependency
from .reference_proposal_dto import DTO, ReturnDTO, ReturnDTOList
from .reference_proposal_model import (
    ReferenceProposalAccept,
    ReferenceProposalAcceptReference,
    ReferenceProposalAcceptReferenceFamily,
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

    @post(path="/", dto=None, include_in_schema=False)
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

    @post(path="/refuse", dto=None, guards=[admin_only], include_in_schema=False)
    async def refuse_reference_pruposal(
        self,
        request: Request,
        reference_proposal_dependency: ReferenceProposalDependency,
        data: ReferenceProposalRefuse,
    ) -> None:
        return await reference_proposal_dependency.refuse(request.user.id, data)

    @post(path="/accept", dto=None, guards=[admin_only], include_in_schema=False)
    async def accept(
        self,
        request: Request,
        reference_proposal_dependency: ReferenceProposalDependency,
        data: ReferenceProposalAccept,
    ) -> None:
        return await reference_proposal_dependency.accept(request.user.id, data)

    @post(path="/accept_reference", dto=None, guards=[admin_only], include_in_schema=False)
    async def accept_reference(
        self,
        request: Request,
        reference_dependency: ReferenceDependency,
        reference_proposal_dependency: ReferenceProposalDependency,
        data: ReferenceProposalAcceptReference,
    ) -> None:
        reference_insert = ReferenceInsert(
            reference_family_id=data.reference_family_id,
            reference_name=data.reference_name,
            reference_source=data.reference_source,
        )

        reference = await reference_dependency.insert(reference_insert)

        reference_proposal_accept = ReferenceProposalAccept(
            reference_proposal_id=data.reference_proposal_id,
            reference_id=reference.id,
            fusion_id=data.fusion_id,
        )

        return await reference_proposal_dependency.accept(request.user.id, reference_proposal_accept)

    @post(path="/accept_reference_family", dto=None, guards=[admin_only], include_in_schema=False)
    async def accept_reference_family(
        self,
        request: Request,
        reference_dependency: ReferenceDependency,
        reference_family_dependency: ReferenceFamilyDependency,
        reference_proposal_dependency: ReferenceProposalDependency,
        data: ReferenceProposalAcceptReferenceFamily,
    ) -> None:
        reference_family_insert = ReferenceFamilyInsert(reference_family_name=data.reference_family_name)

        reference_family = await reference_family_dependency.insert(reference_family_insert)

        reference_insert = ReferenceInsert(
            reference_family_id=reference_family.id,
            reference_name=data.reference_name,
            reference_source=data.reference_source,
        )

        reference = await reference_dependency.insert(reference_insert)

        reference_proposal_accept = ReferenceProposalAccept(
            reference_proposal_id=data.reference_proposal_id,
            reference_id=reference.id,
            fusion_id=data.fusion_id,
        )

        return await reference_proposal_dependency.accept(request.user.id, reference_proposal_accept)
