from typing import Protocol, runtime_checkable
from uuid import UUID

from .fusion_model import Ranking
from .fusion_table import Fusion


@runtime_checkable
class FusionDependency(Protocol):
    async def draw(self, account_id: UUID, limit: int) -> list[Fusion]:
        pass

    async def ranking(
        self,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        creator_name: str | None = None,
    ) -> list[Ranking]:
        pass
