from litestar import Controller, get

from .reference_dependency import ReferenceDependency
from .reference_table import Reference


class ReferenceController(Controller):
    path = "/reference"

    @get(path="/")
    async def list_references(self, reference_dependency: ReferenceDependency) -> list[Reference]:
        return await reference_dependency.list()
