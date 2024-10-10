from uuid import UUID

from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.component.reference.reference_model import ReferenceInsert

from .reference_dependency import ReferenceDependency
from .reference_table import Reference


class PostgresReferenceDependency(ReferenceDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(
        self,
        reference_family_id: UUID | None = None,
    ) -> list[Reference]:
        query = select(Reference).options(joinedload(Reference.family))

        if reference_family_id is not None:
            query = query.filter(Reference.family_id == reference_family_id)

        result = await self.session.scalars(query)
        instances = result.all()

        return instances

    async def insert(self, data: ReferenceInsert) -> Reference:
        await self.session.execute(
            insert(Reference).values(
                name=data.reference_name,
                source=data.reference_source,
                family_id=data.reference_family_id,
            )
        )

        await self.session.flush()
        await self.session.commit()

        query = (
            select(Reference)
            .where(
                Reference.name == data.reference_name,
                Reference.family_id == data.reference_family_id,
            )
            .options(joinedload(Reference.family))
        )

        result = await self.session.scalars(query)
        instance = result.one()

        return instance


def use_postgres_reference_dependency(db_session: AsyncSession) -> ReferenceDependency:
    return PostgresReferenceDependency(db_session)
