from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.vote import Vote

from .fusion_dependency import FusionDependency
from .fusion_table import Fusion, FusionRepository


class PostgresFusionDependency(FusionDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def draw(self, account_id: UUID, limit: int) -> list[Fusion]:
        query = (
            select(Fusion)
            .join(Vote, Fusion.id == Vote.fusion_id and Vote.account_id == account_id, isouter=True)
            .where(Vote.account_id == None)
            .order_by(func.random())
            .limit(limit)
        )

        result = await self.session.scalars(query)
        instances = result.all()

        return instances


def use_postgres_fusion_dependency(db_session: AsyncSession) -> FusionDependency:
    return PostgresFusionDependency(db_session)
