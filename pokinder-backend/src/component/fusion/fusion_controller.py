import time

from litestar import Controller, get

from src.security import Request

from .fusion_dependency import FusionDependency
from .fusion_dto import DTO, ReturnDTO, ReturnDTODraw
from .fusion_model import Ranking
from .fusion_table import Fusion


class FusionController(Controller):
    dto = DTO
    return_dto = ReturnDTO
    path = "/fusion"

    @get(path="/draw", return_dto=ReturnDTODraw)
    async def draw_fusions(self, request: Request, fusion_dependency: FusionDependency, limit: int) -> list[Fusion]:
        return await fusion_dependency.draw(request.user.id, limit)

    @get(path="/ranking", cache=120)
    async def list_rankings(
        self,
        fusion_dependency: FusionDependency,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[Ranking]:
        return await fusion_dependency.ranking(
            limit,
            offset,
            head_name_or_category,
            body_name_or_category,
            reference_family_name,
            reference_name,
            creator_name,
        )
