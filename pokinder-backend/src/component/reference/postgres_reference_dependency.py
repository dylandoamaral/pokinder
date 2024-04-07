from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.reference import Reference
from sqlalchemy.orm import joinedload

from .reference_dependency import ReferenceDependency
from .reference_table import Reference


class PostgresReferenceDependency(ReferenceDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self) -> list[Reference]:
        query = select(Reference).options(joinedload(Reference.family))

        result = await self.session.scalars(query)
        instances = result.all()

        return instances


def use_postgres_reference_dependency(db_session: AsyncSession) -> ReferenceDependency:
    return PostgresReferenceDependency(db_session)
