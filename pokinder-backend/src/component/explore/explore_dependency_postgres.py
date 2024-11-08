from math import ceil
from uuid import UUID, uuid4

from sqlalchemy import and_, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, joinedload, noload

from src.component.account.account_table import Account
from src.component.creator import Creator
from src.component.explore.explore_model import (
    ExploreHistory,
    ExplorePokedex,
    ExplorePokedexFusion,
    ExploreRanking,
    ExploreReference,
    ExploreReferenceCount,
)
from src.component.family.family_table import Family
from src.component.fusion import Fusion
from src.component.fusion_reference import FusionReference
from src.component.pokemon import Pokemon
from src.component.reference import Reference
from src.component.reference_family.reference_family_table import ReferenceFamily
from src.component.reference_proposal import ReferenceProposal
from src.component.vote import Vote, VoteType
from src.data.pokemon_families import pokemon_families
from src.utils.sqlalchemy import model_to_dict

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
        Head = aliased(Pokemon)
        Body = aliased(Pokemon)

        query = (
            select(func.count(distinct(Vote.fusion_id)))
            .join(Fusion, Vote.fusion_id == Fusion.id)
            .join(Head, Fusion.head_id == Head.id)
            .join(Body, Fusion.body_id == Body.id)
            .join(Fusion.creators)
            .outerjoin(Fusion.references)
            .outerjoin(Reference.family)
        )

        if vote_types is not None:
            query = query.filter(Vote.vote_type.in_(vote_types))
        else:
            return 0

        if head_name_or_category in pokemon_families.keys() or body_name_or_category in pokemon_families.keys():
            families_result = await self.session.scalars(select(Family))
            families = {family.name: family.id for family in families_result.all()}

        query = query.filter(Vote.account_id == account_id)

        if fusion_ids is not None:
            query = query.filter(Vote.fusion_id.in_(fusion_ids))

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                query = query.filter(Head.families.any(Family.id == families[head_name_or_category]))
            else:
                query = query.filter(Head.name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(Body.families.any(Family.id == families[body_name_or_category]))
            else:
                query = query.filter(Body.name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            query = query.filter(ReferenceFamily.name == reference_family_name)

        if reference_name is not None and reference_name != "All":
            query = query.filter(Reference.name == reference_name)

        if creator_name is not None and creator_name != "All":
            query = query.filter(Creator.name == creator_name)

        result = await self.session.scalar(query)

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
        Head = aliased(Pokemon)
        Body = aliased(Pokemon)

        query = (
            select(
                Fusion.id,
                Fusion.path,
                Head.name,
                Head.name_separator_index,
                Body.name,
                Body.name_separator_index,
                Vote.vote_type,
                Vote.created_at,
            )
            .join(Fusion, Vote.fusion_id == Fusion.id)
            .join(Head, Fusion.head_id == Head.id)
            .join(Body, Fusion.body_id == Body.id)
            .join(Fusion.creators)
            .outerjoin(Fusion.references)
            .outerjoin(Reference.family)
        )

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
                query = query.filter(Head.families.any(Family.id == families[head_name_or_category]))
            else:
                query = query.filter(Head.name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(Body.families.any(Family.id == families[body_name_or_category]))
            else:
                query = query.filter(Body.name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            query = query.filter(ReferenceFamily.name == reference_family_name)

        if reference_name is not None and reference_name != "All":
            query = query.filter(Reference.name == reference_name)

        if creator_name is not None and creator_name != "All":
            query = query.filter(Creator.name == creator_name)

        query = (
            query.order_by(Vote.created_at.desc()).offset(offset).limit(limit).distinct(Vote.created_at, Vote.fusion_id)
        )

        result = await self.session.execute(query)
        instances = result.all()

        objects = []

        for instance in instances:
            objects.append(
                ExploreHistory(
                    fusion_id=instance[0],
                    fusion_path=instance[1],
                    fusion_head_name=instance[2],
                    fusion_head_name_separator_index=instance[3],
                    fusion_body_name=instance[4],
                    fusion_body_name_separator_index=instance[5],
                    vote_type=instance[6],
                    vote_created_at=instance[7],
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
        Head = aliased(Pokemon)
        Body = aliased(Pokemon)

        query = (
            select(func.count(distinct(Fusion.id)))
            .join(Head, Fusion.head_id == Head.id)
            .join(Body, Fusion.body_id == Body.id)
            .join(Fusion.creators)
            .outerjoin(Fusion.references)
            .outerjoin(Reference.family)
        )

        if head_name_or_category in pokemon_families.keys() or body_name_or_category in pokemon_families.keys():
            families_result = await self.session.scalars(select(Family))
            families = {family.name: family.id for family in families_result.all()}

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                query = query.filter(Head.families.any(Family.id == families[head_name_or_category]))
            else:
                query = query.filter(Head.name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(Body.families.any(Family.id == families[body_name_or_category]))
            else:
                query = query.filter(Body.name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            query = query.filter(ReferenceFamily.name == reference_family_name)

        if reference_name is not None and reference_name != "All":
            query = query.filter(Reference.name == reference_name)

        if creator_name is not None and creator_name != "All":
            query = query.filter(Creator.name == creator_name)

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
        Head = aliased(Pokemon)
        Body = aliased(Pokemon)

        subquery = (
            select(
                Fusion.id,
                Fusion.path,
                Fusion.head_id,
                Fusion.body_id,
                Fusion.vote_score,
                Fusion.vote_count,
                func.rank()
                .over(
                    order_by=(
                        Fusion.vote_score.desc(),
                        Fusion.vote_count.desc(),
                        Head.pokedex_id,
                        Body.pokedex_id,
                        Fusion.path,
                    )
                )
                .label("rank"),
            )
            .join(Head, Fusion.head_id == Head.id)
            .join(Body, Fusion.body_id == Body.id)
        ).subquery()

        query = (
            select(
                subquery.columns.id,
                subquery.columns.path,
                Head.name,
                Head.name_separator_index,
                Body.name,
                Body.name_separator_index,
                subquery.columns.rank,
                (subquery.columns.vote_score / 2).label("adjusted_score"),
                subquery.columns.vote_count,
            )
            .select_from(subquery)
            .join(Head, subquery.columns.head_id == Head.id)
            .join(Body, subquery.columns.body_id == Body.id)
            .join(Fusion.creators)
            .outerjoin(Fusion.references)
            .outerjoin(Reference.family)
            .order_by(subquery.columns.rank)
            # Note: avoid an issue outputting less line than expected when duplicates due to multiple creators.
            .group_by(
                subquery.columns.id,
                subquery.columns.path,
                subquery.columns.rank,
                subquery.columns.vote_score,
                subquery.columns.vote_count,
                Head,
                Body,
            )
        )

        if head_name_or_category in pokemon_families.keys() or body_name_or_category in pokemon_families.keys():
            families_result = await self.session.scalars(select(Family))
            families = {family.name: family.id for family in families_result.all()}

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                query = query.filter(Head.families.any(Family.id == families[head_name_or_category]))
            else:
                query = query.filter(Head.name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(Body.families.any(Family.id == families[body_name_or_category]))
            else:
                query = query.filter(Body.name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            query = query.filter(ReferenceFamily.name == reference_family_name)

        if reference_name is not None and reference_name != "All":
            query = query.filter(Reference.name == reference_name)

        if creator_name is not None and creator_name != "All":
            query = query.filter(Creator.name == creator_name)

        query = query.offset(offset).limit(limit)

        result = await self.session.execute(query)
        instances = result.unique().all()

        objects = []

        for instance in instances:
            objects.append(
                ExploreRanking(
                    fusion_id=instance[0],
                    fusion_path=instance[1],
                    fusion_head_name=instance[2],
                    fusion_head_name_separator_index=instance[3],
                    fusion_body_name=instance[4],
                    fusion_body_name_separator_index=instance[5],
                    fusion_rank=instance[6],
                    fusion_score=int(instance[7]),
                    fusion_vote_count=instance[8],
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
        Head = aliased(Pokemon)
        Body = aliased(Pokemon)

        query = (
            select(
                Fusion.id,
                Fusion.path,
                Head.name,
                Head.name_separator_index,
                Head.type_1,
                Head.type_2,
                Head.weight,
                Head.height,
                Body.name,
                Body.name_separator_index,
                Body.type_1,
                Body.type_2,
                Body.weight,
                Body.height,
                func.count(Vote.fusion_id) > 0,
            )
            .join(Head, Fusion.head_id == Head.id)
            .join(Body, Fusion.body_id == Body.id)
            .join(Fusion.creators)
            .outerjoin(Fusion.references)
            .outerjoin(Reference.family)
            .outerjoin(Vote, and_(Fusion.id == Vote.fusion_id, Vote.account_id == account_id))
            .order_by(Head.pokedex_id, Body.pokedex_id, Fusion.path)
            .group_by(Fusion, Head, Body)
        )

        if head_name_or_category in pokemon_families.keys() or body_name_or_category in pokemon_families.keys():
            families_result = await self.session.scalars(select(Family))
            families = {family.name: family.id for family in families_result.all()}

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                query = query.filter(Head.families.any(Family.id == families[head_name_or_category]))
            else:
                query = query.filter(Head.name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(Body.families.any(Family.id == families[body_name_or_category]))
            else:
                query = query.filter(Body.name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            query = query.filter(ReferenceFamily.name == reference_family_name)

        if reference_name is not None and reference_name != "All":
            query = query.filter(Reference.name == reference_name)

        if creator_name is not None and creator_name != "All":
            query = query.filter(Creator.name == creator_name)

        query = query.offset(offset).limit(limit)

        result = await self.session.execute(query)
        instances = result.unique().all()

        objects = []

        for instance in instances:
            has_voted = instance[14]
            fusion_information = ExplorePokedexFusion(
                fusion_path=instance[1],
                fusion_head_name=instance[2],
                fusion_head_name_separator_index=instance[3],
                fusion_head_type_1=instance[4],
                fusion_head_type_2=instance[5],
                fusion_head_weight=instance[6],
                fusion_head_height=instance[7],
                fusion_body_name=instance[8],
                fusion_body_name_separator_index=instance[9],
                fusion_body_type_1=instance[10],
                fusion_body_type_2=instance[11],
                fusion_body_weight=instance[12],
                fusion_body_height=instance[13],
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
        Head = aliased(Pokemon)
        Body = aliased(Pokemon)

        query = (
            select(Fusion, ReferenceFamily.name.label("reference_family_name"))
            .select_from(FusionReference)
            .join(Fusion, FusionReference.c.fusion_id == Fusion.id)
            .join(Head, Fusion.head_id == Head.id)
            .join(Body, Fusion.body_id == Body.id)
            .join(Fusion.creators)
            .join(Reference, FusionReference.c.reference_id == Reference.id)
            .join(Reference.family)
            .group_by(Fusion, ReferenceFamily)
        )

        if head_name_or_category in pokemon_families.keys() or body_name_or_category in pokemon_families.keys():
            families_result = await self.session.scalars(select(Family))
            families = {family.name: family.id for family in families_result.all()}

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                query = query.filter(Head.families.any(Family.id == families[head_name_or_category]))
            else:
                query = query.filter(Head.name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(Body.families.any(Family.id == families[body_name_or_category]))
            else:
                query = query.filter(Body.name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            query = query.filter(ReferenceFamily.name == reference_family_name)

        if reference_name is not None and reference_name != "All":
            query = query.filter(Reference.name == reference_name)

        if creator_name is not None and creator_name != "All":
            query = query.filter(Creator.name == creator_name)

        query = query.subquery()

        count_query = (
            select(query.c.reference_family_name, func.count(query.c.id))
            .select_from(query)
            .group_by(query.c.reference_family_name)
            .order_by(query.c.reference_family_name)
        )

        results = await self.session.execute(count_query)
        return [ExploreReferenceCount(result[0], result[1]) for result in results]

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
        Head = aliased(Pokemon)
        Body = aliased(Pokemon)

        # subquery = select(ReferenceFamily.id).order_by(ReferenceFamily.name).offset(offset).limit(limit)

        # if reference_family_name is not None and reference_family_name != "All":
        #    subquery = subquery.filter(ReferenceFamily.name == reference_family_name)

        # subquery = subquery.subquery()

        cte = (
            select(
                Fusion.id,
                Fusion.path,
                Head.name,
                Head.name_separator_index,
                Body.name,
                Body.name_separator_index,
                Reference.name,
                Reference.source,
                Account.username,
                ReferenceFamily.name.label("reference_family_name"),
            )
            .select_from(FusionReference)
            .join(Fusion, FusionReference.c.fusion_id == Fusion.id)
            .join(Head, Fusion.head_id == Head.id)
            .join(Body, Fusion.body_id == Body.id)
            .join(Fusion.creators)
            .join(Reference, FusionReference.c.reference_id == Reference.id)
            .join(Reference.family)
            .join(ReferenceProposal, ReferenceProposal.id == FusionReference.c.reference_proposal_id)
            .join(Account, Account.id == ReferenceProposal.proposer_id)
            # .filter(Reference.family_id.in_(select(subquery)))
            .order_by(ReferenceFamily.name, Reference.name, Head.pokedex_id, Body.pokedex_id, Fusion.path)
        )

        if head_name_or_category in pokemon_families.keys() or body_name_or_category in pokemon_families.keys():
            families_result = await self.session.scalars(select(Family))
            families = {family.name: family.id for family in families_result.all()}

        if head_name_or_category is not None and head_name_or_category != "All":
            if head_name_or_category in pokemon_families.keys():
                cte = cte.filter(Head.families.any(Family.id == families[head_name_or_category]))
            else:
                cte = cte.filter(Head.name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                cte = cte.filter(Body.families.any(Family.id == families[body_name_or_category]))
            else:
                cte = cte.filter(Body.name == body_name_or_category)

        if reference_family_name is not None and reference_family_name != "All":
            cte = cte.filter(ReferenceFamily.name == reference_family_name)

        if reference_name is not None and reference_name != "All":
            cte = cte.filter(Reference.name == reference_name)

        if creator_name is not None and creator_name != "All":
            cte = cte.filter(Creator.name == creator_name)

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
        instances = result.unique().all()

        objects = []

        for instance in instances:
            objects.append(
                ExploreReference(
                    fusion_id=instance[0],
                    fusion_path=instance[1],
                    fusion_head_name=instance[2],
                    fusion_head_name_separator_index=instance[3],
                    fusion_body_name=instance[4],
                    fusion_body_name_separator_index=instance[5],
                    reference_name=instance[6],
                    reference_link=instance[7],
                    reference_proposer_name=instance[8],
                )
            )

        return objects


def use_explore_dependency_postgres(db_session: AsyncSession) -> ExploreDependency:
    return ExploreDependencyPostgres(db_session)
