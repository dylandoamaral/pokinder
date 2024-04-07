from typing import Protocol, runtime_checkable
from uuid import UUID

from .reference_family_table import ReferenceFamily


@runtime_checkable
class ReferenceFamilyDependency(Protocol):
    async def list(self) -> list[ReferenceFamily]:
        pass
