from litestar import Controller, get

from .reference_family_dependency import ReferenceFamilyDependency
from .reference_family_table import ReferenceFamily, ReadDTO, WriteDTO


class ReferenceFamilyController(Controller):
    dto = WriteDTO
    return_dto = ReadDTO
    path = "/reference_family"

    @get(path="/")
    async def list_reference_families(
        self, reference_family_dependency: ReferenceFamilyDependency
    ) -> list[ReferenceFamily]:
        return await reference_family_dependency.list()
