from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, joinedload, noload

from src.component.creator import Creator
from src.component.family.family_table import Family
from src.component.pokemon import Pokemon
from src.component.reference import Reference
from src.component.reference_family.reference_family_table import ReferenceFamily
from src.component.vote import Vote
from src.data.pokemon_families import pokemon_families
from src.utils.sqlalchemy import model_to_dict

from .fusion_dependency import FusionDependency
from .fusion_model import Ranking
from .fusion_table import Fusion


class FusionDependencyPostgres(FusionDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def draw(self, account_id: UUID, limit: int) -> list[Fusion]:
        subquery = (
            select(Fusion)
            .filter(Fusion.is_removed == False)
            .join(Vote, and_(Fusion.id == Vote.fusion_id, Vote.account_id == account_id), isouter=True)
            .filter(Vote.account_id.is_(None))
            .order_by(Fusion.vote_count, func.random())
            .limit(limit)
            .subquery()
        )

        subquery_fusion = aliased(Fusion, subquery)

        query = select(subquery_fusion).options(
            joinedload(subquery_fusion.head, innerjoin=True),
            joinedload(subquery_fusion.body, innerjoin=True),
            joinedload(subquery_fusion.creators, innerjoin=True),
            joinedload(subquery_fusion.references, innerjoin=False).joinedload(Reference.family),
            noload("*"),
        )

        result = await self.session.scalars(query)
        instances = result.unique().all()

        return instances

    async def ranking(
        self,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        reference_family_name: str | None = None,
        reference_name: str | None = None,
        creator_name: str | None = None,
    ) -> list[Ranking]:
        Head = aliased(Pokemon)
        Body = aliased(Pokemon)

        query = (
            select(
                Fusion,
                func.rank()
                .over(
                    order_by=(
                        Fusion.vote_score.desc(),
                        Fusion.vote_count.desc(),
                        Fusion.id,
                    )
                )
                .label("rank"),
            )
            .join(Head, Fusion.head_id == Head.id)
            .join(Body, Fusion.body_id == Body.id)
            .join(Fusion.creators)
            .outerjoin(Fusion.references)
            .outerjoin(Reference.family)
            .options(
                joinedload(Fusion.creators),
                joinedload(Fusion.head, innerjoin=True),
                joinedload(Fusion.body, innerjoin=True),
            )
            .order_by("rank")
            # Avoid duplicate rank caused by multiple creators
            .group_by(Fusion)
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
            fusion = model_to_dict(instance[0])  # TODO: we should use dto instead
            del fusion["creators"]
            del fusion["head_id"]
            del fusion["body_id"]

            objects.append(
                Ranking(
                    fusion=model_to_dict(instance[0]),
                    rank=int(instance[1]),
                )
            )

        return objects


def use_fusion_dependency_postgres(db_session: AsyncSession) -> FusionDependency:
    return FusionDependencyPostgres(db_session)
