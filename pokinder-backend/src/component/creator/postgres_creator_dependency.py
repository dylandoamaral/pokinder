from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.creator import Creator

from .creator_dependency import CreatorDependency
from .creator_table import Creator


class PostgresCreatorDependency(CreatorDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self) -> list[Creator]:
        query = select(Creator)

        result = await self.session.scalars(query)
        instances = result.all()

        return instances


def use_postgres_creator_dependency(db_session: AsyncSession) -> CreatorDependency:
    return PostgresCreatorDependency(db_session)
