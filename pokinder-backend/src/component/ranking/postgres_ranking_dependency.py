from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, joinedload

from src.component.creator.creator_table import Creator
from src.component.family.family_table import Family
from src.component.fusion.fusion_table import Fusion
from src.component.pokemon.pokemon_table import Pokemon
from src.component.ranking.ranking_dependency import RankingDependency
from src.component.ranking.ranking_model import Ranking
from src.component.vote import Vote
from src.data.pokemon_families import pokemon_families
from src.utils.sqlalchemy import model_to_dict


class PostgresRankingDependency(RankingDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(
        self,
        limit: int,
        offset: int = 0,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
        creator_name: str | None = None,
    ) -> list[Ranking]:
        Head = aliased(Pokemon, name="head")
        Body = aliased(Pokemon, name="body")

        scores = (
            select(
                Vote.fusion_id,
                func.count().label("count"),
                func.round(
                    func.sum(
                        case(
                            (Vote.vote_type == "LIKED", 1),
                            (Vote.vote_type == "FAVORITE", 2),
                            else_=0,
                        )
                    )
                    / func.count()
                    * 100
                ).label("score"),
            )
            .group_by(Vote.fusion_id)
            .subquery()
        )

        rankings = select(
            scores.c.fusion_id,
            scores.c.count,
            scores.c.score,
            func.rank()
            .over(
                order_by=(
                    scores.c.score.desc(),
                    scores.c.count.desc(),
                    scores.c.fusion_id,
                )
            )
            .label("rank"),
        ).subquery()

        query = (
            select(Fusion, rankings.c.count, rankings.c.score, rankings.c.rank)
            .join(rankings, Fusion.id == rankings.c.fusion_id)
            .join(Head, Fusion.head_id == Head.id)
            .join(Body, Fusion.body_id == Body.id)
            .join(Fusion.creators)
            .options(
                joinedload(Fusion.head),
                joinedload(Fusion.body),
                joinedload(Fusion.creators),
            )
            .order_by(rankings.c.rank)
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

        if creator_name is not None and creator_name != "All":
            query = query.filter(Creator.name == creator_name)

        query = query.offset(offset).limit(limit)

        result = await self.session.execute(query)
        instances = result.unique().all()

        objects = []

        for instance in instances:
            objects.append(
                Ranking(
                    fusion=model_to_dict(instance[0]),
                    count=instance[1],
                    score=int(instance[2]),
                    rank=int(instance[3]),
                )
            )

        return objects


def use_postgres_ranking_dependency(db_session: AsyncSession) -> RankingDependency:
    return PostgresRankingDependency(db_session)
