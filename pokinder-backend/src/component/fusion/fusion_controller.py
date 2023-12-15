from litestar import Controller, get
from src.security import Request

from src.utils.collection import arreyfy

from .fusion_dependency import FusionDependency
from .fusion_table import Fusion, ReadDTO, WriteDTO


class FusionController(Controller):
    dto = WriteDTO
    return_dto = ReadDTO
    path = "/fusion"

    @get(path="/draw")
    async def draw_fusions(self, request: Request, fusion_dependency: FusionDependency, limit: int) -> list[Fusion]:
        return await fusion_dependency.draw(request.user.id, limit)
