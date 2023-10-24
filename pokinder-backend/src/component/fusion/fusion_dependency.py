from typing import Protocol, runtime_checkable
from uuid import UUID

from .fusion_table import Fusion


@runtime_checkable
class FusionDependency(Protocol):
    async def draw(self, account_id: UUID, limit: int) -> list[Fusion]:
        pass
