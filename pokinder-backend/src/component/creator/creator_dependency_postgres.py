from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .creator_dependency import CreatorDependency
from .creator_table import Creator


class CreatorDependencyPostgres(CreatorDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self) -> list[Creator]:
        query = select(Creator)

        result = await self.session.scalars(query)
        instances = result.all()

        return instances


def use_creator_dependency_postgres(db_session: AsyncSession) -> CreatorDependency:
    return CreatorDependencyPostgres(db_session)
