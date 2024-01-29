from litestar import Controller, get

from src.security import Request
from src.utils.collection import arreyfy

from .creator_dependency import CreatorDependency
from .creator_table import Creator, ReadDTO, WriteDTO


class CreatorController(Controller):
    dto = WriteDTO
    return_dto = ReadDTO
    path = "/creator"

    @get(path="/")
    async def list_creators(self, creator_dependency: CreatorDependency) -> list[Creator]:
        return await creator_dependency.list()
