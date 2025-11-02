from uuid import UUID

from sqlalchemy import and_, distinct, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.account.account_table import Account
from src.component.explore.explore_model import (
    ExploreHistory,
    ExplorePokedex,
    ExplorePokedexFusion,
    ExploreRanking,
    ExploreReference,
    ExploreReferenceCount,
)
from src.component.family.family_table import Family
from src.component.fusion import FusionDenormalized
from src.component.fusion_reference import FusionReference
from src.component.reference import Reference
from src.component.reference_family.reference_family_table import ReferenceFamily
from src.component.reference_proposal import ReferenceProposal
from src.component.vote import Vote, VoteType
from src.data.pokemon_families import pokemon_families

from .explore_dependency import ExploreDependency


class ExploreDependencyPostgres(ExploreDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def count_history(
        self,
        account_id: UUID,
        fusion_ids: list[int] | None = None,
        vote_types: list[VoteType] | None = None,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> int:
        query = select(distinct(Vote.fusion_id)).join(FusionDenormalized, Vote.fusion_id == FusionDenormalized.id)

        if vote_types is not None:
            query = query.filter(Vote.vote_type.in_(vote_types))
        else:
            return 0

        query = query.filter(Vote.account_id == account_id)

        if fusion_ids is not None:
            query = query.filter(Vote.fusion_id.in_(fusion_ids))

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                query = query.filter(FusionDenormalized.head_families.contains([{"name": head_name_or_category}]))
            else:
                query = query.filter(FusionDenormalized.head_name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(FusionDenormalized.body_families.contains([{"name": body_name_or_category}]))
            else:
                query = query.filter(FusionDenormalized.body_name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            query = query.filter(FusionDenormalized.references.contains([{"family_name": reference_family_name}]))

        if reference_name is not None and reference_name != "All":
            # TODO: find a way to reproduce the following behaviour using denormalized table.
            # query = query.filter(or_(Reference.name == reference_name, Reference.name.startswith(f"{reference_name} ")))
            query = query.filter(FusionDenormalized.references.contains([{"name": reference_name}]))

        if creator_name is not None and creator_name != "All":
            query = query.filter(FusionDenormalized.creators.contains([{"name": creator_name}]))

        count = select(func.count()).select_from(query)

        result = await self.session.scalar(count)

        return result

    async def list_history(
        self,
        account_id: UUID,
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
        query = select(
            FusionDenormalized.id,
            FusionDenormalized.path,
            FusionDenormalized.is_removed,
            FusionDenormalized.head_name,
            FusionDenormalized.head_name_separator_index,
            FusionDenormalized.head_name,
            FusionDenormalized.body_name_separator_index,
            FusionDenormalized.references,
            Vote.vote_type,
            Vote.created_at,
        ).join(FusionDenormalized, Vote.fusion_id == FusionDenormalized.id)

        if head_name_or_category in pokemon_families.keys() or body_name_or_category in pokemon_families.keys():
            families_result = await self.session.scalars(select(Family))
            families = {family.name: family.id for family in families_result.all()}

        if vote_types is not None:
            query = query.filter(Vote.vote_type.in_(vote_types))
        else:
            return []

        query = query.filter(Vote.account_id == account_id)

        if fusion_ids is not None:
            query = query.filter(Vote.fusion_id.in_(fusion_ids))

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                query = query.filter(FusionDenormalized.head_families.contains([{"name": head_name_or_category}]))
            else:
                query = query.filter(FusionDenormalized.head_name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(FusionDenormalized.body_families.contains([{"name": body_name_or_category}]))
            else:
                query = query.filter(FusionDenormalized.body_name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            query = query.filter(FusionDenormalized.references.contains([{"family_name": reference_family_name}]))

        if reference_name is not None and reference_name != "All":
            # TODO: find a way to reproduce the following behaviour using denormalized table.
            # query = query.filter(or_(Reference.name == reference_name, Reference.name.startswith(f"{reference_name} ")))
            query = query.filter(FusionDenormalized.references.contains([{"name": reference_name}]))

        if creator_name is not None and creator_name != "All":
            query = query.filter(FusionDenormalized.creators.contains([{"name": creator_name}]))

        query = (
            query.order_by(Vote.created_at.desc())
            .offset(offset)
            .limit(limit)
            .distinct(
                Vote.created_at,
                Vote.fusion_id,
            )
        )

        result = await self.session.execute(query)
        instances = result.all()

        objects = []

        for instance in instances:
            objects.append(
                ExploreHistory(
                    fusion_id=instance[0],
                    fusion_path=instance[1],
                    fusion_is_removed=instance[2],
                    fusion_head_name=instance[3],
                    fusion_head_name_separator_index=instance[4],
                    fusion_body_name=instance[5],
                    fusion_body_name_separator_index=instance[6],
                    fusion_references=instance[7],
                    vote_type=instance[8],
                    vote_created_at=instance[9],
                )
            )

        return objects

    async def count_fusion(
        self,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> int:
        query = select(func.count()).select_from(FusionDenormalized)

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                query = query.filter(FusionDenormalized.head_families.contains([{"name": head_name_or_category}]))
            else:
                query = query.filter(FusionDenormalized.head_name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(FusionDenormalized.body_families.contains([{"name": body_name_or_category}]))
            else:
                query = query.filter(FusionDenormalized.body_name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            query = query.filter(FusionDenormalized.references.contains([{"family_name": reference_family_name}]))

        if reference_name is not None and reference_name != "All":
            # TODO: find a way to reproduce the following behaviour using denormalized table.
            # query = query.filter(or_(Reference.name == reference_name, Reference.name.startswith(f"{reference_name} ")))
            query = query.filter(FusionDenormalized.references.contains([{"name": reference_name}]))

        if creator_name is not None and creator_name != "All":
            query = query.filter(FusionDenormalized.creators.contains([{"name": creator_name}]))

        result = await self.session.scalar(query)

        return result

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
        query = select(
            FusionDenormalized.id,
            FusionDenormalized.path,
            FusionDenormalized.is_removed,
            FusionDenormalized.head_name,
            FusionDenormalized.head_name_separator_index,
            FusionDenormalized.body_name,
            FusionDenormalized.body_name_separator_index,
            FusionDenormalized.references,
            FusionDenormalized.vote_rank,
            FusionDenormalized.vote_score,
            FusionDenormalized.vote_count,
        ).order_by(FusionDenormalized.vote_rank)

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                query = query.filter(FusionDenormalized.head_families.contains([{"name": head_name_or_category}]))
            else:
                query = query.filter(FusionDenormalized.head_name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(FusionDenormalized.body_families.contains([{"name": body_name_or_category}]))
            else:
                query = query.filter(FusionDenormalized.body_name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            query = query.filter(FusionDenormalized.references.contains([{"family_name": reference_family_name}]))

        if reference_name is not None and reference_name != "All":
            # TODO: find a way to reproduce the following behaviour using denormalized table.
            # query = query.filter(or_(Reference.name == reference_name, Reference.name.startswith(f"{reference_name} ")))
            query = query.filter(FusionDenormalized.references.contains([{"name": reference_name}]))

        if creator_name is not None and creator_name != "All":
            query = query.filter(FusionDenormalized.creators.contains([{"name": creator_name}]))

        query = query.offset(offset).limit(limit)

        result = await self.session.execute(query)
        instances = result.all()

        objects = []

        for instance in instances:
            objects.append(
                ExploreRanking(
                    fusion_id=instance[0],
                    fusion_path=instance[1],
                    fusion_is_removed=instance[2],
                    fusion_head_name=instance[3],
                    fusion_head_name_separator_index=instance[4],
                    fusion_body_name=instance[5],
                    fusion_body_name_separator_index=instance[6],
                    fusion_references=instance[7],
                    fusion_rank=instance[8],
                    fusion_score=instance[9],
                    fusion_vote_count=instance[10],
                )
            )

        return objects

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
        query = (
            select(
                FusionDenormalized.id,
                FusionDenormalized.path,
                FusionDenormalized.is_removed,
                FusionDenormalized.head_name,
                FusionDenormalized.head_name_separator_index,
                FusionDenormalized.head_type_1,
                FusionDenormalized.head_type_2,
                FusionDenormalized.head_weight,
                FusionDenormalized.head_height,
                FusionDenormalized.body_name,
                FusionDenormalized.body_name_separator_index,
                FusionDenormalized.body_type_1,
                FusionDenormalized.body_type_2,
                FusionDenormalized.body_weight,
                FusionDenormalized.body_height,
                FusionDenormalized.references,
                func.count(Vote.fusion_id) > 0,
            )
            .outerjoin(Vote, and_(FusionDenormalized.id == Vote.fusion_id, Vote.account_id == account_id))
            .order_by(
                FusionDenormalized.head_pokedex_id,
                FusionDenormalized.body_pokedex_id,
                FusionDenormalized.path,
                FusionDenormalized.id,
            )
            .group_by(FusionDenormalized)
        )

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                query = query.filter(FusionDenormalized.head_families.contains([{"name": head_name_or_category}]))
            else:
                query = query.filter(FusionDenormalized.head_name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(FusionDenormalized.body_families.contains([{"name": body_name_or_category}]))
            else:
                query = query.filter(FusionDenormalized.body_name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            query = query.filter(FusionDenormalized.references.contains([{"family_name": reference_family_name}]))

        if reference_name is not None and reference_name != "All":
            # TODO: find a way to reproduce the following behaviour using denormalized table.
            # query = query.filter(or_(Reference.name == reference_name, Reference.name.startswith(f"{reference_name} ")))
            query = query.filter(FusionDenormalized.references.contains([{"name": reference_name}]))

        if creator_name is not None and creator_name != "All":
            query = query.filter(FusionDenormalized.creators.contains([{"name": creator_name}]))

        query = query.offset(offset).limit(limit)

        result = await self.session.execute(query)
        instances = result.all()

        objects = []

        for instance in instances:
            has_voted = instance[16]
            fusion_information = ExplorePokedexFusion(
                fusion_path=instance[1],
                fusion_is_removed=instance[2],
                fusion_head_name=instance[3],
                fusion_head_name_separator_index=instance[4],
                fusion_head_type_1=instance[5],
                fusion_head_type_2=instance[6],
                fusion_head_weight=instance[7],
                fusion_head_height=instance[8],
                fusion_body_name=instance[9],
                fusion_body_name_separator_index=instance[10],
                fusion_body_type_1=instance[11],
                fusion_body_type_2=instance[12],
                fusion_body_weight=instance[13],
                fusion_body_height=instance[14],
                fusion_references=instance[15],
            )

            objects.append(
                ExplorePokedex(
                    fusion_id=instance[0],
                    fusion_information=fusion_information if has_voted else None,
                    has_voted=has_voted,
                )
            )

        return objects

    async def count_references(
        self,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[ExploreReferenceCount]:
        query = (
            select(
                FusionDenormalized.id.label("fusion_id"),
                Reference.id.label("reference_id"),
                ReferenceFamily.name.label("reference_family_name"),
            )
            .distinct(FusionDenormalized.id, Reference.id)
            .select_from(FusionReference)
            .join(FusionDenormalized, FusionReference.c.fusion_id == FusionDenormalized.id)
            .join(Reference, FusionReference.c.reference_id == Reference.id)
            .join(Reference.family)
            .group_by(FusionDenormalized, Reference, ReferenceFamily)
        )

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                query = query.filter(FusionDenormalized.head_families.contains([{"name": head_name_or_category}]))
            else:
                query = query.filter(FusionDenormalized.head_name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(FusionDenormalized.body_families.contains([{"name": body_name_or_category}]))
            else:
                query = query.filter(FusionDenormalized.body_name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            query = query.filter(ReferenceFamily.name == reference_family_name)

        if reference_name is not None and reference_name != "All":
            query = query.filter(or_(Reference.name == reference_name, Reference.name.startswith(f"{reference_name} ")))

        if creator_name is not None and creator_name != "All":
            query = query.filter(FusionDenormalized.creators.contains([{"name": creator_name}]))

        query = query.subquery()

        count_query = (
            select(query.c.reference_family_name, func.count(query.c.fusion_id))
            .select_from(query)
            .group_by(query.c.reference_family_name)
            .order_by(query.c.reference_family_name)
        )

        results = await self.session.execute(count_query)
        return [ExploreReferenceCount(result[0], int(result[1])) for result in results]

    async def list_references(
        self,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[ExploreReference]:
        cte = (
            select(
                FusionDenormalized.id,
                FusionDenormalized.path,
                FusionDenormalized.is_removed,
                FusionDenormalized.head_name,
                FusionDenormalized.head_name_separator_index,
                FusionDenormalized.body_name,
                FusionDenormalized.body_name_separator_index,
                FusionDenormalized.references,
                Reference.name,
                Reference.source,
                Account.username,
                ReferenceFamily.name.label("reference_family_name"),
            )
            .select_from(FusionReference)
            .join(FusionDenormalized, FusionReference.c.fusion_id == FusionDenormalized.id)
            .join(Reference, FusionReference.c.reference_id == Reference.id)
            .join(Reference.family)
            .join(ReferenceProposal, ReferenceProposal.id == FusionReference.c.reference_proposal_id)
            .join(Account, Account.id == ReferenceProposal.proposer_id)
            .order_by(
                ReferenceFamily.name,
                Reference.name,
                FusionDenormalized.head_pokedex_id,
                FusionDenormalized.body_pokedex_id,
                FusionDenormalized.path,
                FusionDenormalized.id,
            )
        )

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                cte = cte.filter(FusionDenormalized.head_families.contains([{"name": head_name_or_category}]))
            else:
                cte = cte.filter(FusionDenormalized.head_name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                cte = cte.filter(FusionDenormalized.body_families.contains([{"name": body_name_or_category}]))
            else:
                cte = cte.filter(FusionDenormalized.body_name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            cte = cte.filter(ReferenceFamily.name == reference_family_name)

        if reference_name is not None and reference_name != "All":
            cte = cte.filter(or_(Reference.name == reference_name, Reference.name.startswith(f"{reference_name} ")))

        if creator_name is not None and creator_name != "All":
            cte = cte.filter(FusionDenormalized.creators.contains([{"name": creator_name}]))

        cte = cte.cte()

        subquery = (
            select(cte.c.reference_family_name)
            .group_by(cte.c.reference_family_name)
            .order_by(cte.c.reference_family_name)
            .offset(offset)
            .limit(limit)
        ).subquery()

        query = select(cte).filter(cte.c.reference_family_name.in_(select(subquery)))

        result = await self.session.execute(query)
        instances = result.all()

        objects = []

        for instance in instances:
            objects.append(
                ExploreReference(
                    fusion_id=instance[0],
                    fusion_path=instance[1],
                    fusion_is_removed=instance[2],
                    fusion_head_name=instance[3],
                    fusion_head_name_separator_index=instance[4],
                    fusion_body_name=instance[5],
                    fusion_body_name_separator_index=instance[6],
                    fusion_references=instance[7],
                    reference_name=instance[8],
                    reference_link=instance[9],
                    reference_proposer_name=instance[10],
                )
            )

        return objects


def use_explore_dependency_postgres(db_session: AsyncSession) -> ExploreDependency:
    return ExploreDependencyPostgres(db_session)
