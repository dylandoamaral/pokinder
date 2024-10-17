from litestar import Controller, get

from src.security import Request

from .analytics_dependency import AnalyticsDependency
from .analytics_model import Analytics


class AnalyticsController(Controller):
    path = "/analytics"

    @get(path="/", cache=120)
    async def retrieve_rankings(
        self,
        request: Request,
        analytics_dependency: AnalyticsDependency,
    ) -> list[Analytics]:
        return await analytics_dependency.get(request.user.id)
