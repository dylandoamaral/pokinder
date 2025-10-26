from litestar import Controller, get

from src.security import Request

from .fusion_dependency import FusionDependency
from .fusion_dto import DTO, ReturnDTO, ReturnDTODraw
from .fusion_model import FusionDraw


class FusionController(Controller):
    dto = DTO
    return_dto = ReturnDTO
    path = "/fusion"

    @get(path="/draw", return_dto=ReturnDTODraw)
    async def draw_fusions(self, request: Request, fusion_dependency: FusionDependency, limit: int) -> list[FusionDraw]:
        return await fusion_dependency.draw(request.user.id, limit)
