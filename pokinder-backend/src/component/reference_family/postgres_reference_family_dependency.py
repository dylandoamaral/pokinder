from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.reference_family import ReferenceFamily

from .reference_family_dependency import ReferenceFamilyDependency
from .reference_family_table import ReferenceFamily


class PostgresReferenceFamilyDependency(ReferenceFamilyDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self) -> list[ReferenceFamily]:
        query = select(ReferenceFamily)

        result = await self.session.scalars(query)
        instances = result.all()

        return instances


def use_postgres_reference_family_dependency(db_session: AsyncSession) -> ReferenceFamilyDependency:
    return PostgresReferenceFamilyDependency(db_session)
