from litestar import Controller, get

from src.component.ranking.ranking_dependency import RankingDependency
from src.component.ranking.ranking_model import Ranking


class RankingController(Controller):
    path = "/ranking"

    @get(path="/")
    async def retrieve_rankings(
        self,
        ranking_dependency: RankingDependency,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
    ) -> list[Ranking]:
        return await ranking_dependency.list(
            limit,
            offset,
            head_name_or_category,
            body_name_or_category,
        )
