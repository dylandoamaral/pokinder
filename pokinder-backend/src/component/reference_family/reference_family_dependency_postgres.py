from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.reference_family.reference_family_model import ReferenceFamilyInsert

from .reference_family_dependency import ReferenceFamilyDependency
from .reference_family_table import ReferenceFamily


class ReferenceFamilyDependencyPostgres(ReferenceFamilyDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self) -> list[ReferenceFamily]:
        query = select(ReferenceFamily)

        result = await self.session.scalars(query)
        instances = result.all()

        return instances

    async def insert(self, data: ReferenceFamilyInsert) -> ReferenceFamily:
        await self.session.execute(
            insert(ReferenceFamily).values(
                name=data.reference_family_name,
            )
        )

        await self.session.flush()
        await self.session.commit()

        query = select(ReferenceFamily).where(
            ReferenceFamily.name == data.reference_family_name,
        )

        result = await self.session.scalars(query)
        instance = result.one()

        return instance


def use_reference_family_dependency_postgres(db_session: AsyncSession) -> ReferenceFamilyDependency:
    return ReferenceFamilyDependencyPostgres(db_session)
