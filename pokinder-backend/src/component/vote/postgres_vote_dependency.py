from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, joinedload

from src.component.family.family_table import Family
from src.component.fusion.fusion_table import Fusion
from src.component.pokemon.pokemon_table import Pokemon
from src.component.vote.vote_model import VoteAdd
from src.data.pokemon_families import pokemon_families

from .vote_dependency import VoteDependency
from .vote_table import Vote, VoteRepository, VoteType


class PostgresVoteDependency(VoteDependency):
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = VoteRepository(session=session)

    async def list(
        self,
        account_id: UUID,
        limit: int,
        offset: int = 0,
        fusion_ids: list[int] | None = None,
        vote_types: list[VoteType] | None = None,
        head_name_or_category: str | None = None,
        body_name_or_category: str | None = None,
    ) -> list[Vote]:
        Head = aliased(Pokemon)
        Body = aliased(Pokemon)

        query = (
            select(Vote)
            .join(Fusion, Vote.fusion_id == Fusion.id)
            .join(Head, Fusion.head_id == Head.id)
            .join(Body, Fusion.body_id == Body.id)
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
                query = query.filter(Head.families.any(Family.id.in_([families[head_name_or_category]])))
            else:
                query = query.filter(Head.name == head_name_or_category)
        if body_name_or_category is not None and body_name_or_category != "All":
            if body_name_or_category in pokemon_families.keys():
                query = query.filter(Body.families.any(Family.id.in_([families[body_name_or_category]])))
            else:
                query = query.filter(Body.name == body_name_or_category)

        query = query.order_by(Vote.created_at.desc()).offset(offset).limit(limit)

        result = await self.session.scalars(query)
        instances = result.all()

        return instances

    async def upsert(self, account_id: UUID, vote_add: VoteAdd) -> Vote:
        vote = Vote(account_id=account_id, fusion_id=vote_add.fusion_id, vote_type=vote_add.vote_type)
        return await self.repository.upsert(vote, auto_commit=True)


def use_postgres_vote_dependency(db_session: AsyncSession) -> VoteDependency:
    return PostgresVoteDependency(db_session)
