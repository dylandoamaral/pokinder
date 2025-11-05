from uuid import UUID

from sqlalchemy import and_, func, select, tablesample
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.vote import Vote

from .fusion_denormalized_table import FusionDenormalized
from .fusion_dependency import FusionDependency
from .fusion_model import FusionDraw


class FusionDependencyPostgres(FusionDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def draw(self, account_id: UUID, limit: int) -> list[FusionDraw]:
        FusionDenormalizedSampled = tablesample(FusionDenormalized, 5)

        query = (
            select(
                FusionDenormalizedSampled.c.id,
                FusionDenormalizedSampled.c.path,
                FusionDenormalizedSampled.c.is_removed,
                FusionDenormalizedSampled.c.head_name,
                FusionDenormalizedSampled.c.head_name_separator_index,
                FusionDenormalizedSampled.c.head_type_1,
                FusionDenormalizedSampled.c.head_type_2,
                FusionDenormalizedSampled.c.head_pokedex_id,
                FusionDenormalizedSampled.c.body_name,
                FusionDenormalizedSampled.c.body_name_separator_index,
                FusionDenormalizedSampled.c.body_type_1,
                FusionDenormalizedSampled.c.body_type_2,
                FusionDenormalizedSampled.c.body_pokedex_id,
                FusionDenormalizedSampled.c.creators,
                FusionDenormalizedSampled.c.references,
            )
            .outerjoin(Vote, and_(FusionDenormalizedSampled.c.id == Vote.fusion_id, Vote.account_id == account_id))
            .filter(Vote.account_id.is_(None))
            .order_by(FusionDenormalizedSampled.c.vote_count, func.random())
            .limit(limit)
        )

        result = await self.session.execute(query)
        instances = result.all()

        objects = []

        for instance in instances:
            objects.append(
                FusionDraw(
                    id=instance[0],
                    path=instance[1],
                    is_removed=instance[2],
                    head_name=instance[3],
                    head_name_separator_index=instance[4],
                    head_type_1=instance[5],
                    head_type_2=instance[6],
                    head_pokedex_id=instance[7],
                    body_name=instance[8],
                    body_name_separator_index=instance[9],
                    body_type_1=instance[10],
                    body_type_2=instance[11],
                    body_pokedex_id=instance[12],
                    creators=instance[13],
                    references=instance[14],
                )
            )

        return objects


def use_fusion_dependency_postgres(db_session: AsyncSession) -> FusionDependency:
    return FusionDependencyPostgres(db_session)
