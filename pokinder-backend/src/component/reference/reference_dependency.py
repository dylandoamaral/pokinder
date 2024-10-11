from typing import Protocol, runtime_checkable
from uuid import UUID

from src.component.reference.reference_model import ReferenceInsert

from .reference_table import Reference


@runtime_checkable
class ReferenceDependency(Protocol):
    async def list(
        self,
        reference_family_id: UUID | None = None,
        reference_family_name: str | None = None,
    ) -> list[Reference]:
        pass

    async def insert(self, data: ReferenceInsert) -> Reference:
        pass
