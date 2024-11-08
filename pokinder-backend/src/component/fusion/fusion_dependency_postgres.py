from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, joinedload, noload

from src.component.reference import Reference
from src.component.vote import Vote

from .fusion_dependency import FusionDependency
from .fusion_table import Fusion


class FusionDependencyPostgres(FusionDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def draw(self, account_id: UUID, limit: int) -> list[Fusion]:
        subquery = (
            select(Fusion)
            .filter(Fusion.is_removed == False)
            .outerjoin(Vote, and_(Fusion.id == Vote.fusion_id, Vote.account_id == account_id))
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


def use_fusion_dependency_postgres(db_session: AsyncSession) -> FusionDependency:
    return FusionDependencyPostgres(db_session)
