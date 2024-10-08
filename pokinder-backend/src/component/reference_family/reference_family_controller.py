from litestar import Controller, get, post

from src.component.reference_family.reference_family_model import ReferenceFamilyInsert

from .reference_family_dependency import ReferenceFamilyDependency
from .reference_family_dto import DTO, ReturnDTO
from .reference_family_table import ReferenceFamily


class ReferenceFamilyController(Controller):
    dto = DTO
    return_dto = ReturnDTO
    path = "/reference_family"

    @get(path="/")
    async def list_reference_families(
        self,
        reference_family_dependency: ReferenceFamilyDependency,
    ) -> list[ReferenceFamily]:
        return await reference_family_dependency.list()

    @post(path="/", dto=None)
    async def insert_reference_family(
        self,
        data: ReferenceFamilyInsert,
        reference_family_dependency: ReferenceFamilyDependency,
    ) -> ReferenceFamily:
        return await reference_family_dependency.insert(data)
