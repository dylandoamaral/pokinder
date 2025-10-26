from typing import Protocol, runtime_checkable
from uuid import UUID

from .fusion_model import FusionDraw


@runtime_checkable
class FusionDependency(Protocol):
    async def draw(self, account_id: UUID, limit: int) -> list[FusionDraw]:
        pass
