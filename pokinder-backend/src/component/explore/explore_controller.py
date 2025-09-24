from litestar import Controller, get
from litestar.config.response_cache import default_cache_key_builder

from src.component.explore.explore_model import (
    ExploreHistory,
    ExplorePokedex,
    ExploreRanking,
    ExploreReference,
    ExploreReferenceCount,
)
from src.component.vote import VoteType
from src.security import Request

from .explore_dependency import ExploreDependency


class ExploreController(Controller):
    path = "/explore"
    include_in_schema = False

    # Note: used by pokinder website for history mode in explore panel
    @get(path="/history/count", cache=False)
    async def retrieve_history_count(
        self,
        request: Request,
        explore_dependency: ExploreDependency,
        fusion_ids: list[int] | None = None,
        vote_types: list[VoteType] | None = None,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> int:
        return await explore_dependency.count_history(
            request.user.id,
            fusion_ids,
            vote_types,
            head_name_or_category,
            body_name_or_category,
            reference_family_name,
            reference_name,
            creator_name,
        )

    # Note: used by pokinder website for history mode in explore panel
    @get(path="/history", cache=False)
    async def retrieve_history(
        self,
        request: Request,
        explore_dependency: ExploreDependency,
        limit: int,
        offset: int = 0,
        fusion_ids: list[int] | None = None,
        vote_types: list[VoteType] | None = None,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[ExploreHistory]:
        return await explore_dependency.list_history(
            request.user.id,
            limit,
            offset,
            fusion_ids,
            vote_types,
            head_name_or_category,
            body_name_or_category,
            reference_family_name,
            reference_name,
            creator_name,
        )

    # Note: used by pokinder website for both pokedex and ranking modes in explore panel
    @get(path="/fusion/count", cache=3600, cache_key_builder=default_cache_key_builder)
    async def count_fusion(
        self,
        explore_dependency: ExploreDependency,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> int:
        return await explore_dependency.count_fusion(
            head_name_or_category,
            body_name_or_category,
            reference_family_name,
            reference_name,
            creator_name,
        )

    # Note: used by pokinder website for ranking mode in explore panel
    @get(path="/ranking", cache=600, cache_key_builder=default_cache_key_builder)
    async def list_rankings(
        self,
        explore_dependency: ExploreDependency,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[ExploreRanking]:
        return await explore_dependency.list_ranking(
            limit,
            offset,
            head_name_or_category,
            body_name_or_category,
            reference_family_name,
            reference_name,
            creator_name,
        )

    # Note: used by pokinder website for pokedex mode in explore panel
    @get(path="/pokedex", cache=120)
    async def list_pokedex(
        self,
        request: Request,
        explore_dependency: ExploreDependency,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[ExplorePokedex]:
        return await explore_dependency.list_pokedex(
            request.user.id,
            limit,
            offset,
            head_name_or_category,
            body_name_or_category,
            reference_family_name,
            reference_name,
            creator_name,
        )

    # Note: used by pokinder website for reference mode in explore panel
    @get(path="/reference/count")
    async def count_references(
        self,
        explore_dependency: ExploreDependency,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[ExploreReferenceCount]:
        return await explore_dependency.count_references(
            head_name_or_category,
            body_name_or_category,
            reference_family_name,
            reference_name,
            creator_name,
        )

    # Note: used by pokinder website for reference mode in explore panel
    @get(path="/reference")
    async def list_references(
        self,
        explore_dependency: ExploreDependency,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[ExploreReference]:
        return await explore_dependency.list_references(
            limit,
            offset,
            head_name_or_category,
            body_name_or_category,
            reference_family_name,
            reference_name,
            creator_name,
        )
