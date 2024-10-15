from uuid import UUID

from litestar import Controller, get, post

from src.component.reference.reference_model import ReferenceInsert
from src.security.guard import admin_only

from .reference_dependency import ReferenceDependency
from .reference_dto import DTO, ReturnDTO
from .reference_table import Reference


class ReferenceController(Controller):
    dto = DTO
    return_dto = ReturnDTO
    path = "/reference"

    @get(path="/")
    async def list_references(
        self,
        reference_dependency: ReferenceDependency,
        reference_family_id: UUID | None = None,
        reference_family_name: str | None = None,
    ) -> list[Reference]:
        return await reference_dependency.list(reference_family_id, reference_family_name)

    @post(path="/", dto=None, guards=[admin_only], include_in_schema=False)
    async def insert_reference(
        self,
        reference_dependency: ReferenceDependency,
        data: ReferenceInsert,
    ) -> Reference:
        return await reference_dependency.insert(data)
