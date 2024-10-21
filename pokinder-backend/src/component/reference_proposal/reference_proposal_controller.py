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
from src.shared.dependency.notification_dependency import NotificationDependency
from src.shared.dependency.statistics_dependency import StatisticsDependency
from src.utils.discord import render_milestone_total, render_milestone_total_with_image
from src.utils.env import retrieve_milestone_reference, retrieve_minio_endpoint

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

    async def __accept(
        self,
        account_id: UUID,
        reference_proposal_accept: ReferenceProposalAccept,
        reference_proposal_dependency: ReferenceProposalDependency,
        statistics_dependency: StatisticsDependency,
        notification_dependency: NotificationDependency,
    ) -> None:
        total_reference = await statistics_dependency.add_total_reference()
        if total_reference % retrieve_milestone_reference() == 0:
            fusion_url = f"{retrieve_minio_endpoint()}/fusions/{reference_proposal_accept.fusion_id}.webp"
            notification_dependency.send_notification(
                render_milestone_total_with_image(
                    total_reference,
                    "references",
                    fusion_url,
                )
            )

        return await reference_proposal_dependency.accept(account_id, reference_proposal_accept)

    @post(path="/accept", dto=None, guards=[admin_only], include_in_schema=False)
    async def accept(
        self,
        request: Request,
        reference_proposal_dependency: ReferenceProposalDependency,
        statistics_dependency: StatisticsDependency,
        notification_dependency: NotificationDependency,
        data: ReferenceProposalAccept,
    ) -> None:
        return await self.__accept(
            request.user.id,
            data,
            reference_proposal_dependency,
            statistics_dependency,
            notification_dependency,
        )

    @post(path="/accept_reference", dto=None, guards=[admin_only], include_in_schema=False)
    async def accept_reference(
        self,
        request: Request,
        reference_dependency: ReferenceDependency,
        reference_proposal_dependency: ReferenceProposalDependency,
        statistics_dependency: StatisticsDependency,
        notification_dependency: NotificationDependency,
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

        return await self.__accept(
            request.user.id,
            reference_proposal_accept,
            reference_proposal_dependency,
            statistics_dependency,
            notification_dependency,
        )

    @post(path="/accept_reference_family", dto=None, guards=[admin_only], include_in_schema=False)
    async def accept_reference_family(
        self,
        request: Request,
        reference_dependency: ReferenceDependency,
        reference_family_dependency: ReferenceFamilyDependency,
        reference_proposal_dependency: ReferenceProposalDependency,
        statistics_dependency: StatisticsDependency,
        notification_dependency: NotificationDependency,
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

        return await self.__accept(
            request.user.id,
            reference_proposal_accept,
            reference_proposal_dependency,
            statistics_dependency,
            notification_dependency,
        )
