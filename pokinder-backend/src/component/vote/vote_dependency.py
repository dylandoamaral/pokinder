from typing import Protocol, runtime_checkable
from uuid import UUID

from litestar.contrib.repository import FilterTypes

from .vote_table import Vote, VoteType


@runtime_checkable
class VoteDependency(Protocol):
    async def list(
        self,
        limit: int,
        offset: int = 0,
        account_ids: list[UUID] | None = None,
        fusion_ids: list[int] | None = None,
        vote_type: list[VoteType] | None = None,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
    ) -> list[Vote]:
        pass

    async def upsert(self, vote: Vote) -> Vote:
        pass
