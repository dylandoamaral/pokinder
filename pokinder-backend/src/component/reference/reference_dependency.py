from typing import Protocol, runtime_checkable
from uuid import UUID

from .reference_table import Reference


@runtime_checkable
class ReferenceDependency(Protocol):
    async def list(self) -> list[Reference]:
        pass
