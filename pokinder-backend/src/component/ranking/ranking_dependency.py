from typing import Protocol, runtime_checkable
from uuid import UUID

from src.component.ranking.ranking_model import Ranking


@runtime_checkable
class RankingDependency(Protocol):
    async def list(
        self,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
    ) -> list[Ranking]:
        pass
