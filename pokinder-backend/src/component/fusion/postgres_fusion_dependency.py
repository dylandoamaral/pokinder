from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, joinedload

from src.component.creator import Creator
from src.component.fusion_creator import FusionCreator
from src.component.pokemon import Pokemon
from src.component.vote import Vote

from .fusion_dependency import FusionDependency
from .fusion_table import Fusion, FusionRepository


class PostgresFusionDependency(FusionDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def draw(self, account_id: UUID, limit: int) -> list[Fusion]:
        subquery = (
            select(Fusion)
            .filter(Fusion.is_removed == False)
            .join(Vote, and_(Fusion.id == Vote.fusion_id, Vote.account_id == account_id), isouter=True)
            .filter(Vote.account_id.is_(None))
            .order_by(func.random())
            .limit(limit)
            .subquery()
        )

        subquery_fusion = aliased(Fusion, subquery)

        query = select(subquery_fusion).options(
            joinedload(subquery_fusion.head, innerjoin=True),
            joinedload(subquery_fusion.body, innerjoin=True),
            joinedload(subquery_fusion.creators, innerjoin=True),
        )

        result = await self.session.scalars(query)
        instances = result.unique().all()

        print(instances[0].creators)

        return instances


def use_postgres_fusion_dependency(db_session: AsyncSession) -> FusionDependency:
    return PostgresFusionDependency(db_session)
