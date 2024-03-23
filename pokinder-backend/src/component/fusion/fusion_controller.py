import time

from litestar import Controller, get

from src.security import Request
from src.utils.collection import arreyfy

from .fusion_dependency import FusionDependency
from .fusion_model import Ranking
from .fusion_table import Fusion, ReadDTO, WriteDTO


class FusionController(Controller):
    dto = WriteDTO
    return_dto = ReadDTO
    path = "/fusion"

    @get(path="/draw")
    async def draw_fusions(self, request: Request, fusion_dependency: FusionDependency, limit: int) -> list[Fusion]:
        return await fusion_dependency.draw(request.user.id, limit)

    @get(path="/ranking")
    async def retrieve_rankings(
        self,
        fusion_dependency: FusionDependency,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        creator_name: str | None = None,
    ) -> list[Ranking]:
        return await fusion_dependency.ranking(
            limit,
            offset,
            head_name_or_category,
            body_name_or_category,
            creator_name,
        )
