import asyncio
from datetime import datetime
from typing import Optional
from uuid import UUID

from litestar import Request
from litestar.stores.base import Store
from sqlalchemy import case, desc, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.account.account_table import Account
from src.component.creator.creator_table import Creator
from src.component.fusion.fusion_table import Fusion
from src.component.fusion_reference.fusion_reference_table import FusionReference
from src.component.pokemon.pokemon_table import Pokemon
from src.component.reference.reference_table import Reference
from src.component.reference_family.reference_family_table import ReferenceFamily
from src.component.reference_proposal.reference_proposal_table import (
    ReferenceProposal,
    ReferenceProposalStatus,
)
from src.component.vote import Vote
from src.component.vote.vote_model import VoteType
from src.shared.dependency.statistics_dependency import StatisticsDependency
from src.utils.cache import ONE_MINUTE, Cache

from .analytics_dependency import AnalyticsDependency
from .analytics_model import (
    Analytics,
    CommunityAnalytics,
    CreatorAnalytics,
    PokemonAnalytics,
    UserAnalytics,
)


class AnalyticsDependencyPostgres(AnalyticsDependency):
    def __init__(self, session: AsyncSession, store: Store, statistics_dependency: StatisticsDependency):
        self.session = session
        self.store = store
        self.cache = Cache(store)
        self.statistics_dependency = statistics_dependency

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

    async def __vote_type_count(self, maybe_account_id=None) -> dict:
        query = select(Vote.vote_type, func.count().label("count")).group_by(Vote.vote_type)
        if maybe_account_id:
            query = query.filter(Vote.account_id == maybe_account_id)
        result = await self.session.execute(query)
        counts = {str(vote_type.value): count for vote_type, count in result}
        return counts

    async def __calculate_average_score(self, vote_score_column, vote_count_column):
        result = await self.session.execute(
            select((func.sum(vote_score_column * vote_count_column) / func.sum(vote_count_column)))
        )
        return result.scalar_one()

    def __select_average_score(self, vote_score_column, vote_count_column):
        return func.round(func.sum(vote_score_column * vote_count_column) / func.sum(vote_count_column))

    def __select_bayesian_average_score(
        self, vote_score_column, vote_count_column, global_mean_score, smoothing_factor
    ):
        numerator = global_mean_score * smoothing_factor + func.sum(vote_score_column * vote_count_column)
        denominator = smoothing_factor + func.sum(vote_count_column)
        return numerator / denominator

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

        global_mean_score = await self.__calculate_average_score(
            vote_score_column=scores.c.score,
            vote_count_column=scores.c.count,
        )

        query = (
            select(
                Pokemon.name,
                Pokemon.pokedex_id,
                self.__select_average_score(
                    vote_score_column=scores.c.score,
                    vote_count_column=scores.c.count,
                ),
                self.__select_bayesian_average_score(
                    vote_score_column=scores.c.score,
                    vote_count_column=scores.c.count,
                    global_mean_score=global_mean_score,
                    smoothing_factor=20,
                ).label("scores"),
            )
            .join(Fusion, Pokemon.id == getattr(Fusion, fusion_attribute))
            .join(scores, Fusion.id == scores.c.fusion_id)
            .group_by(Pokemon.name, Pokemon.pokedex_id)
            .order_by(desc("scores"))
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

        global_mean_score = await self.__calculate_average_score(
            vote_score_column=Fusion.vote_score,
            vote_count_column=Fusion.vote_count,
        )

        query = (
            select(
                Pokemon.name,
                Pokemon.pokedex_id,
                self.__select_average_score(
                    vote_score_column=Fusion.vote_score,
                    vote_count_column=Fusion.vote_count,
                ),
                self.__select_bayesian_average_score(
                    vote_score_column=Fusion.vote_score,
                    vote_count_column=Fusion.vote_count,
                    global_mean_score=global_mean_score,
                    smoothing_factor=100,
                ).label("scores"),
            )
            .join(Fusion, Pokemon.id == getattr(Fusion, fusion_attribute))
            .group_by(Pokemon.name, Pokemon.pokedex_id)
            .order_by(desc("scores"))
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

        global_mean_score = await self.__calculate_average_score(
            vote_score_column=scores.c.score,
            vote_count_column=scores.c.count,
        )

        query = (
            select(
                Creator.id,
                Creator.name,
                self.__select_average_score(
                    vote_score_column=scores.c.score,
                    vote_count_column=scores.c.count,
                ),
                self.__select_bayesian_average_score(
                    vote_score_column=scores.c.score,
                    vote_count_column=scores.c.count,
                    global_mean_score=global_mean_score,
                    smoothing_factor=20,
                ).label("scores"),
            )
            .join(Fusion.creators)
            .join(scores, Fusion.id == scores.c.fusion_id)
            .group_by(Creator.id, Creator.name)
            .order_by(desc("scores"))
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

    async def __favorite_community_creator(self) -> Optional[CreatorAnalytics]:
        global_mean_score = await self.__calculate_average_score(
            vote_score_column=Fusion.vote_score,
            vote_count_column=Fusion.vote_count,
        )

        query = (
            select(
                Creator.id,
                Creator.name,
                self.__select_average_score(
                    vote_score_column=Fusion.vote_score,
                    vote_count_column=Fusion.vote_count,
                ),
                self.__select_bayesian_average_score(
                    vote_score_column=Fusion.vote_score,
                    vote_count_column=Fusion.vote_count,
                    global_mean_score=global_mean_score,
                    smoothing_factor=100,
                ).label("scores"),
            )
            .join(Fusion.creators)
            .group_by(Creator.id, Creator.name)
            .order_by(desc("scores"))
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

    async def __reference_proposer_count(self) -> int:
        query = (
            select(func.count(distinct(ReferenceProposal.proposer_id)))
            .select_from(ReferenceProposal)
            .where(ReferenceProposal.status == ReferenceProposalStatus.VALIDATED)
        )
        result = await self.session.execute(query)
        count = result.scalar()
        return count

    async def __validated_reference_proposal_count(self, account_id) -> int:
        query = (
            select(func.count())
            .select_from(ReferenceProposal)
            .where(
                ReferenceProposal.proposer_id == account_id,
                ReferenceProposal.status == ReferenceProposalStatus.VALIDATED,
            )
        )
        result = await self.session.execute(query)
        count = result.scalar()
        return count

    async def __reference_proposal_count(self, account_id) -> int:
        query = select(func.count()).select_from(ReferenceProposal).where(ReferenceProposal.proposer_id == account_id)
        result = await self.session.execute(query)
        count = result.scalar()
        return count

    async def _fake_user_count() -> int:
        return 1

    async def get(self, account_id: UUID) -> list[Analytics]:
        ten_minutes = ONE_MINUTE * 10

        user_count_query = self.cache.get_or_set_int(
            key="user_count",
            awaitable=self.__user_count(),
            expires_in=ten_minutes,
        )
        fusion_count_query = self.cache.get_or_set_int(
            key="fusion_count",
            awaitable=self.__count(Fusion),
            expires_in=ten_minutes,
        )
        creator_count_query = self.cache.get_or_set_int(
            key="creator_count",
            awaitable=self.__count(Creator),
            expires_in=ten_minutes,
        )
        vote_type_count_query = self.cache.get_or_set_dict(
            key="vote_type_count",
            awaitable=self.__vote_type_count(),
            expires_in=ten_minutes,
        )
        favorite_pokemon_head_query = self.cache.get_or_set_model(
            key="favorite_pokemon_head",
            model=PokemonAnalytics,
            awaitable=self.__favorite_community_pokemon(is_head=True),
            expires_in=ten_minutes,
        )
        favorite_pokemon_body_query = self.cache.get_or_set_model(
            key="favorite_pokemon_body",
            model=PokemonAnalytics,
            awaitable=self.__favorite_community_pokemon(is_head=False),
            expires_in=ten_minutes,
        )
        favorite_creator_query = self.cache.get_or_set_model(
            key="favorite_creator",
            model=CreatorAnalytics,
            awaitable=self.__favorite_community_creator(),
            expires_in=ten_minutes,
        )

        results = await asyncio.gather(
            user_count_query,
            fusion_count_query,
            creator_count_query,
            vote_type_count_query,
            favorite_pokemon_head_query,
            favorite_pokemon_body_query,
            favorite_creator_query,
            self.__rank(account_id),
            self.__created_at(account_id),
            self.__vote_type_count(account_id),
            self.__favorite_account_pokemon(is_head=True, account_id=account_id),
            self.__favorite_account_pokemon(is_head=False, account_id=account_id),
            self.__favorite_account_creator(account_id=account_id),
            self.__count(ReferenceFamily),
            self.__count(Reference),
            self.statistics_dependency.get_total_reference(),
            self.__reference_proposer_count(),
            self.__validated_reference_proposal_count(account_id=account_id),
            self.__reference_proposal_count(account_id=account_id),
        )

        dislike_count = results[3].get(str(VoteType.DISLIKED.value), 0)
        favorite_count = results[3].get(str(VoteType.FAVORITE.value), 0)
        like_count = results[3].get(str(VoteType.LIKED.value), 0)
        vote_count = dislike_count + favorite_count + like_count

        user_dislike_count = results[9].get(str(VoteType.DISLIKED.value), 0)
        user_favorite_count = results[9].get(str(VoteType.FAVORITE.value), 0)
        user_like_count = results[9].get(str(VoteType.LIKED.value), 0)
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
                reference_family_count=results[13],
                reference_count=results[14],
                reference_fusion_count=results[15],
                reference_proposer_count=results[16],
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
                validated_reference_proposal_count=results[17],
                reference_proposal_count=results[18],
            ),
        )


def use_analytics_dependency_postgres(
    db_session: AsyncSession,
    request: Request,
    statistics_dependency: StatisticsDependency,
) -> AnalyticsDependency:
    return AnalyticsDependencyPostgres(db_session, request.app.stores.get("statistics"), statistics_dependency)
