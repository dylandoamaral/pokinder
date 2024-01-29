from typing import Protocol, runtime_checkable
from uuid import UUID

from .creator_table import Creator


@runtime_checkable
class CreatorDependency(Protocol):
    async def list(self) -> list[Creator]:
        pass
