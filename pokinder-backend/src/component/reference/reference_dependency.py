from typing import Protocol, runtime_checkable

from src.component.reference.reference_model import ReferenceInsert

from .reference_table import Reference


@runtime_checkable
class ReferenceDependency(Protocol):
    async def list(self) -> list[Reference]:
        pass

    async def insert(self, data: ReferenceInsert) -> Reference:
        pass
