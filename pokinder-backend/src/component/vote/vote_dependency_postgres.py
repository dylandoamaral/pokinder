from uuid import UUID

from sqlalchemy import distinct, func, insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, joinedload, noload

from src.component.creator.creator_table import Creator
from src.component.family.family_table import Family
from src.component.fusion.fusion_table import Fusion
from src.component.pokemon.pokemon_table import Pokemon
from src.component.reference.reference_table import Reference
from src.component.reference_family.reference_family_table import ReferenceFamily
from src.component.vote.vote_model import VoteAdd
from src.component.vote.vote_table import VoteType
from src.data.pokemon_families import pokemon_families

from .vote_dependency import VoteDependency
from .vote_table import Vote, VoteType


class VoteDependencyPostgres(VoteDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def upsert(self, account_id: UUID, vote_add: VoteAdd) -> None:
        result = await self.session.scalars(
            select(Vote).where(Vote.account_id == account_id, Vote.fusion_id == vote_add.fusion_id)
        )
        maybe_old_vote = result.one_or_none()
        vote_score = vote_add.vote_type.to_score()

        # Update the score of the vote
        if maybe_old_vote:
            old_vote_score = maybe_old_vote.vote_type.to_score()
            vote_score = vote_add.vote_type.to_score()
            total_score = (Fusion.vote_score * Fusion.vote_count) + vote_score - old_vote_score
            await self.session.execute(
                update(Fusion)
                .where(Fusion.id == vote_add.fusion_id)
                .values(vote_score=(total_score / Fusion.vote_count))
            )
            await self.session.execute(
                update(Vote)
                .where(Vote.account_id == account_id, Vote.fusion_id == vote_add.fusion_id)
                .values(vote_type=vote_add.vote_type)
            )
        # Insert a new vote to the system
        else:
            await self.session.execute(
                update(Fusion)
                .where(Fusion.id == vote_add.fusion_id)
                .values(
                    vote_count=Fusion.vote_count + 1,
                    vote_score=((Fusion.vote_score * Fusion.vote_count) + vote_score) / (Fusion.vote_count + 1),
                )
            )
            await self.session.execute(
                insert(Vote).values(
                    account_id=account_id,
                    fusion_id=vote_add.fusion_id,
                    vote_type=vote_add.vote_type,
                )
            )

        await self.session.flush()
        await self.session.commit()


def use_vote_dependency_postgres(db_session: AsyncSession) -> VoteDependency:
    return VoteDependencyPostgres(db_session)
