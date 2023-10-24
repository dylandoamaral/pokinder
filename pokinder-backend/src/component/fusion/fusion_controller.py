from uuid import UUID

from litestar import Controller, get

from src.utils.collection import arreyfy

from .fusion_dependency import FusionDependency
from .fusion_table import Fusion, ReadDTO, WriteDTO


class FusionController(Controller):
    dto = WriteDTO
    return_dto = ReadDTO
    path = "/fusion"

    @get(path="/draw")
    async def draw_fusions(self, fusion_dependency: FusionDependency, account_id: UUID, limit: int) -> list[Fusion]:
        return await fusion_dependency.draw(account_id, limit)
