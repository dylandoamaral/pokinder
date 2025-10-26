from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.reference import Reference
from src.component.vote import Vote

from .fusion_denormalized_table import FusionDenormalized
from .fusion_dependency import FusionDependency
from .fusion_model import FusionDraw


class FusionDependencyPostgres(FusionDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def draw(self, account_id: UUID, limit: int) -> list[FusionDraw]:
        query = (
            select(
                FusionDenormalized.id,
                FusionDenormalized.path,
                FusionDenormalized.is_removed,
                FusionDenormalized.head_name,
                FusionDenormalized.head_name_separator_index,
                FusionDenormalized.head_type_1,
                FusionDenormalized.head_type_2,
                FusionDenormalized.head_pokedex_id,
                FusionDenormalized.body_name,
                FusionDenormalized.body_name_separator_index,
                FusionDenormalized.body_type_1,
                FusionDenormalized.body_type_2,
                FusionDenormalized.body_pokedex_id,
                FusionDenormalized.creators,
                FusionDenormalized.references,
            )
            .outerjoin(Vote, and_(FusionDenormalized.id == Vote.fusion_id, Vote.account_id == account_id))
            .filter(Vote.account_id.is_(None))
            .order_by(FusionDenormalized.vote_count, func.random())
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
