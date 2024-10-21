from litestar import Controller, get, post

from src.component.vote.vote_model import VoteAdd
from src.security import Request
from src.shared.dependency.notification_dependency import NotificationDependency
from src.shared.dependency.statistics_dependency import StatisticsDependency
from src.utils.discord import render_milestone_total_with_image
from src.utils.env import retrieve_milestone_vote, retrieve_minio_endpoint

from .vote_dependency import VoteDependency
from .vote_dto import DTO, ReturnDTO
from .vote_table import Vote, VoteType


class VoteController(Controller):
    dto = DTO
    return_dto = ReturnDTO
    path = "/vote"

    @get(path="/")
    async def retrieve_votes(
        self,
        request: Request,
        vote_dependency: VoteDependency,
        limit: int,
        offset: int = 0,
        fusion_ids: list[int] | None = None,
        vote_types: list[VoteType] | None = None,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[Vote]:
        return await vote_dependency.list(
            request.user.id,
            limit,
            offset,
            fusion_ids,
            vote_types,
            head_name_or_category,
            body_name_or_category,
            reference_family_name,
            reference_name,
            creator_name,
        )

    @post(path="/", dto=None, include_in_schema=False)
    async def post_vote(
        self,
        request: Request,
        vote_dependency: VoteDependency,
        statistics_dependency: StatisticsDependency,
        notification_dependency: NotificationDependency,
        data: VoteAdd,
    ) -> None:
        vote = await vote_dependency.upsert(request.user.id, data)

        total_vote = await statistics_dependency.add_total_vote()
        if total_vote % retrieve_milestone_vote() == 0:
            fusion_url = f"{retrieve_minio_endpoint()}/fusions/{data.fusion_id}.webp"
            notification_dependency.send_notification(
                render_milestone_total_with_image(
                    total_vote,
                    "votes",
                    fusion_url,
                )
            )

        return vote
