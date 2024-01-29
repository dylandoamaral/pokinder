from typing import Protocol, runtime_checkable
from uuid import UUID

from src.component.vote.vote_model import VoteAdd
from src.component.vote.vote_table import Vote, VoteType


@runtime_checkable
class VoteDependency(Protocol):
    async def list(
        self,
        account_id: UUID,
        limit: int,
        offset: int = 0,
        fusion_ids: list[int] | None = None,
        vote_type: list[VoteType] | None = None,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        creator_name: str | None = None,
    ) -> list[Vote]:
        pass

    async def upsert(self, account_id: UUID, vote_add: VoteAdd) -> Vote:
        pass
