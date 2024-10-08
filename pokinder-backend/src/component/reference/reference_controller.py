from litestar import Controller, get, post
from src.component.reference.reference_model import ReferenceInsert

from .reference_dependency import ReferenceDependency
from .reference_table import Reference
from .reference_dto import DTO, ReturnDTO


class ReferenceController(Controller):
    dto = DTO
    return_dto = ReturnDTO
    path = "/reference"

    @get(path="/")
    async def list_references(self, reference_dependency: ReferenceDependency) -> list[Reference]:
        return await reference_dependency.list()

    @post(path="/", dto=None)
    async def insert_reference(
        self,
        data: ReferenceInsert,
        reference_dependency: ReferenceDependency,
    ) -> Reference:
        return await reference_dependency.insert(data)
