from typing import Protocol, runtime_checkable

from src.component.reference_family.reference_family_model import ReferenceFamilyInsert

from .reference_family_table import ReferenceFamily


@runtime_checkable
class ReferenceFamilyDependency(Protocol):
    async def list(self) -> list[ReferenceFamily]:
        pass

    async def insert(self, data: ReferenceFamilyInsert) -> ReferenceFamily:
        pass
