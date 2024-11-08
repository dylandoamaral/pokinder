from typing import Protocol, runtime_checkable
from uuid import UUID

from src.component.vote.vote_model import VoteAdd
from src.component.vote.vote_table import Vote, VoteType


@runtime_checkable
class VoteDependency(Protocol):
    async def upsert(self, account_id: UUID, vote_add: VoteAdd) -> None:
        pass
