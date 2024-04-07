from uuid import UUID

from litestar import Controller, get, post, put

from src.component.vote.vote_model import VoteAdd
from src.security import Request

from .vote_dependency import VoteDependency
from .vote_table import ReadDTO, PostDTO, Vote, VoteType, WriteDTO


class VoteController(Controller):
    dto = WriteDTO
    return_dto = ReadDTO
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
            creator_name,
        )

    @post(path="/", dto=None, return_dto=PostDTO)
    async def post_vote(
        self,
        request: Request,
        data: VoteAdd,
        vote_dependency: VoteDependency,
    ) -> Vote:
        return await vote_dependency.upsert(request.user.id, data)
