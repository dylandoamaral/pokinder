from litestar import Controller, get

from src.security import Request
from src.utils.collection import arreyfy

from .creator_dependency import CreatorDependency
from .creator_table import Creator
from .creator_dto import DTO, ReturnDTO


class CreatorController(Controller):
    dto = DTO
    return_dto = ReturnDTO
    path = "/creator"

    @get(path="/")
    async def list_creators(self, creator_dependency: CreatorDependency) -> list[Creator]:
        return await creator_dependency.list()
