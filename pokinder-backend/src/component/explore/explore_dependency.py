from typing import Protocol, runtime_checkable
from uuid import UUID

from src.component.vote import VoteType

from .explore_model import (
    ExploreHistory,
    ExplorePokedex,
    ExploreRanking,
    ExploreReference,
    ExploreReferenceCount,
)


@runtime_checkable
class ExploreDependency(Protocol):
    async def count_history(
        self,
        account_id: UUID,
        fusion_ids: list[int] | None = None,
        vote_type: list[VoteType] | None = None,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> int:
        pass

    async def list_history(
        self,
        account_id: UUID,
        limit: int,
        offset: int = 0,
        fusion_ids: list[int] | None = None,
        vote_type: list[VoteType] | None = None,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[ExploreHistory]:
        pass

    async def count_fusion(
        self,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> int:
        pass

    async def list_ranking(
        self,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[ExploreRanking]:
        pass

    async def list_pokedex(
        self,
        account_id: UUID,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[ExplorePokedex]:
        pass

    async def count_reference(
        self,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[ExploreReferenceCount]:
        pass

    async def list_reference(
        self,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[ExploreReference]:
        pass
