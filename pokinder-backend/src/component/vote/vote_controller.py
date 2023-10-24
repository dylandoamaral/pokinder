from uuid import UUID

from litestar import Controller, get, post, put

from .vote_dependency import VoteDependency
from .vote_table import ReadDTO, Vote, VoteType, WriteDTO


class VoteController(Controller):
    dto = WriteDTO
    return_dto = ReadDTO
    path = "/vote"

    @get(path="/")
    async def retrieve_votes(
        self,
        vote_dependency: VoteDependency,
        limit: int,
        offset: int = 0,
        account_ids: list[UUID] | None = None,
        fusion_ids: list[int] | None = None,
        vote_types: list[VoteType] | None = None,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
    ) -> list[Vote]:
        return await vote_dependency.list(
            limit,
            offset,
            account_ids,
            fusion_ids,
            vote_types,
            head_name_or_category,
            body_name_or_category,
        )

    @post(path="/")
    async def post_vote(
        self,
        data: Vote,
        vote_dependency: VoteDependency,
    ) -> Vote:
        return await vote_dependency.upsert(data)
