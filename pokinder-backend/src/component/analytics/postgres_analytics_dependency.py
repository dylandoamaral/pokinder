import asyncio
import time
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import case, desc, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.account.account_table import Account
from src.component.analytics.analytics_dependency import AnalyticsDependency
from src.component.creator.creator_table import Creator
from src.component.fusion.fusion_table import Fusion
from src.component.pokemon.pokemon_table import Pokemon
from src.component.vote import Vote
from src.component.vote.vote_model import VoteType

from .analytics_dependency import AnalyticsDependency
from .analytics_model import (
    Analytics,
    CommunityAnalytics,
    CreatorAnalytics,
    PokemonAnalytics,
    UserAnalytics,
)


class PostgresAnalyticsDependency(AnalyticsDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def __count(self, table) -> int:
        query = select(func.count()).select_from(table)
        result = await self.session.execute(query)
        count = result.scalar()
        return count

    async def __user_count(self) -> int:
        query = select(func.count(distinct(Vote.account_id))).select_from(Vote)
        result = await self.session.execute(query)
        count = result.scalar()
        return count

    async def __vote_type_count(self, maybe_account_id=None) -> int:
        query = select(Vote.vote_type, func.count().label("count")).group_by(Vote.vote_type)
        if maybe_account_id:
            query = query.filter(Vote.account_id == maybe_account_id)
        result = await self.session.execute(query)
        counts = {vote_type: count for vote_type, count in result}
        return counts

    async def __favorite_account_pokemon(self, is_head, account_id=None) -> Optional[PokemonAnalytics]:
        fusion_attribute = "head_id" if is_head else "body_id"
        scores = (
            select(
                Vote.fusion_id,
                func.count().label("count"),
                func.round(
                    func.sum(
                        case(
                            (Vote.vote_type == "LIKED", VoteType.LIKED.to_score()),
                            (Vote.vote_type == "FAVORITE", VoteType.FAVORITE.to_score()),
                            else_=VoteType.DISLIKED.to_score(),
                        )
                    )
                    / func.count()
                ).label("score"),
            )
            .filter(Vote.account_id == account_id)
            .group_by(Vote.fusion_id)
        )
        scores = scores.subquery()
        query = (
            select(Pokemon.name, Pokemon.pokedex_id, func.avg(scores.c.score))
            .join(Fusion, Pokemon.id == getattr(Fusion, fusion_attribute))
            .join(scores, Fusion.id == scores.c.fusion_id)
            .group_by(Pokemon.name, Pokemon.pokedex_id)
            .order_by(func.avg(scores.c.score).desc(), func.sum(scores.c.count).desc())
            .limit(1)
        )
        result = await self.session.execute(query)
        information = result.one_or_none()
        if not information:
            return None
        return PokemonAnalytics(
            name=information[0],
            filename=information[1],
            average_score=int(information[2]),
        )

    async def __favorite_community_pokemon(self, is_head) -> Optional[PokemonAnalytics]:
        fusion_attribute = "head_id" if is_head else "body_id"
        query = (
            select(Pokemon.name, Pokemon.pokedex_id, func.avg(Fusion.vote_score))
            .join(Fusion, Pokemon.id == getattr(Fusion, fusion_attribute))
            .group_by(Pokemon.name, Pokemon.pokedex_id)
            .order_by(func.avg(Fusion.vote_score).desc(), func.sum(Fusion.vote_count).desc())
            .filter(Fusion.vote_count > 0)
            .limit(1)
        )
        result = await self.session.execute(query)
        information = result.one_or_none()
        if not information:
            return None
        return PokemonAnalytics(
            name=information[0],
            filename=information[1],
            average_score=int(information[2]),
        )

    async def __favorite_account_creator(self, account_id) -> Optional[CreatorAnalytics]:
        scores = (
            select(
                Vote.fusion_id,
                func.count().label("count"),
                func.round(
                    func.sum(
                        case(
                            (Vote.vote_type == "LIKED", VoteType.LIKED.to_score()),
                            (Vote.vote_type == "FAVORITE", VoteType.FAVORITE.to_score()),
                            else_=VoteType.DISLIKED.to_score(),
                        )
                    )
                    / func.count()
                ).label("score"),
            )
            .filter(Vote.account_id == account_id)
            .group_by(Vote.fusion_id)
        )
        scores = scores.subquery()
        query = (
            select(
                Creator.id,
                Creator.name,
                (func.sum(scores.c.score) / func.sum(scores.c.count)).label("scores"),
            )
            .join(Fusion.creators)
            .join(scores, Fusion.id == scores.c.fusion_id)
            .group_by(Creator.id, Creator.name)
            .having(func.sum(scores.c.count) >= 5)
            .order_by(desc("scores"), func.sum(scores.c.count).desc())
            .limit(1)
        )
        result = await self.session.execute(query)
        information = result.one_or_none()
        if not information:
            return None
        id = information[0]
        name = information[1]
        average_score = information[2]
        query = (
            select(Fusion.id)
            .join(scores, Fusion.id == scores.c.fusion_id)
            .where(Fusion.creators.any(Creator.id == id))
            .order_by(scores.c.score.desc(), scores.c.count)
            .limit(1)
        )
        result = await self.session.execute(query)
        fusion_id = result.scalar()
        return CreatorAnalytics(
            name=name,
            filename=fusion_id,
            average_score=int(average_score),
        )

    async def __favorite_community_creator(self) -> Optional[PokemonAnalytics]:
        query = (
            select(
                Creator.id,
                Creator.name,
                (func.sum(Fusion.vote_score) / func.sum(Fusion.vote_count)).label("scores"),
            )
            .join(Fusion.creators)
            .group_by(Creator.id, Creator.name)
            .having(func.sum(Fusion.vote_count) >= 10)
            .order_by(desc("scores"), func.sum(Fusion.vote_count).desc())
            .limit(1)
        )
        result = await self.session.execute(query)
        information = result.one_or_none()
        if not information:
            return None
        id = information[0]
        name = information[1]
        average_score = information[2]
        query = (
            select(Fusion.id)
            .where(Fusion.creators.any(Creator.id == id))
            .order_by(Fusion.vote_score.desc(), Fusion.vote_count.desc())
            .limit(1)
        )
        result = await self.session.execute(query)
        fusion_id = result.scalar()
        return CreatorAnalytics(
            name=name,
            filename=fusion_id,
            average_score=int(average_score),
        )

    async def __created_at(self, account_id) -> Optional[datetime]:
        query = select(Account.created_at).filter(Account.id == account_id).limit(1)
        result = await self.session.execute(query)
        created_at = result.one_or_none()
        if created_at is None:
            return None
        return created_at[0]

    async def __rank(self, account_id) -> Optional[int]:
        subquery = (
            select(
                Vote.account_id,
                func.rank().over(order_by=func.count().desc()).label("rank"),
            )
            .group_by(Vote.account_id)
            .order_by("rank")
        ).subquery()
        query = select(subquery.c.rank).where(subquery.c.account_id == account_id)
        result = await self.session.execute(query)
        rank = result.one_or_none()
        if rank is None:
            return None
        return rank[0]

    async def get(self, account_id: UUID) -> list[Analytics]:
        time.sleep(10)

        results = await asyncio.gather(
            self.__user_count(),
            self.__count(Fusion),
            self.__count(Creator),
            self.__vote_type_count(),
            self.__favorite_community_pokemon(is_head=True),
            self.__favorite_community_pokemon(is_head=False),
            self.__favorite_community_creator(),
            self.__rank(account_id),
            self.__created_at(account_id),
            self.__vote_type_count(account_id),
            self.__favorite_account_pokemon(is_head=True, account_id=account_id),
            self.__favorite_account_pokemon(is_head=False, account_id=account_id),
            self.__favorite_account_creator(account_id=account_id),
        )

        dislike_count = results[3].get(VoteType.DISLIKED, 0)
        favorite_count = results[3].get(VoteType.FAVORITE, 0)
        like_count = results[3].get(VoteType.LIKED, 0)
        vote_count = dislike_count + favorite_count + like_count

        user_dislike_count = results[9].get(VoteType.DISLIKED, 0)
        user_favorite_count = results[9].get(VoteType.FAVORITE, 0)
        user_like_count = results[9].get(VoteType.LIKED, 0)
        user_vote_count = user_dislike_count + user_favorite_count + user_like_count

        return Analytics(
            community=CommunityAnalytics(
                account_count=results[0],
                fusion_count=results[1],
                creator_count=results[2],
                vote_count=vote_count,
                dislike_count=dislike_count,
                favorite_count=favorite_count,
                like_count=like_count,
                favorite_pokemon_head=results[4],
                favorite_pokemon_body=results[5],
                favorite_creator=results[6],
            ),
            user=UserAnalytics(
                rank=results[7] or results[0],
                created_at=results[8],
                vote_count=user_vote_count,
                dislike_count=user_dislike_count,
                favorite_count=user_favorite_count,
                like_count=user_like_count,
                favorite_pokemon_head=results[10],
                favorite_pokemon_body=results[11],
                favorite_creator=results[12],
            ),
        )


def use_postgres_analytics_dependency(db_session: AsyncSession) -> AnalyticsDependency:
    return PostgresAnalyticsDependency(db_session)
