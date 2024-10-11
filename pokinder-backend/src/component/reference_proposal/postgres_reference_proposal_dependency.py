from datetime import datetime, timezone
from uuid import UUID

from litestar.exceptions import NotFoundException
from sqlalchemy import insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.component.fusion.fusion_table import Fusion
from src.component.fusion_reference.fusion_reference_table import FusionReference
from src.component.reference.reference_table import Reference

from .reference_proposal_dependency import ReferenceProposalDependency
from .reference_proposal_model import (
    ReferenceProposalAccept,
    ReferenceProposalAdd,
    ReferenceProposalRefuse,
)
from .reference_proposal_table import (
    ReferenceProposal,
    ReferenceProposalRepository,
    ReferenceProposalStatus,
)


class PostgresReferenceProposalDependency(ReferenceProposalDependency):
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = ReferenceProposalRepository(session=session)

    async def list(
        self,
        limit: int,
        offset: int = 0,
    ) -> list[ReferenceProposal]:
        query = (
            select(ReferenceProposal)
            .options(joinedload(ReferenceProposal.fusion).joinedload(Fusion.references).joinedload(Reference.family))
            .filter(ReferenceProposal.status == ReferenceProposalStatus.PENDING)
            .order_by(ReferenceProposal.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.scalars(query)
        instances = result.unique().all()

        return instances

    async def post(
        self,
        proposer_id: UUID,
        data: ReferenceProposalAdd,
    ) -> ReferenceProposal:
        proposal = ReferenceProposal(
            status=ReferenceProposalStatus.PENDING,
            proposer_id=proposer_id,
            fusion_id=data.fusions_id,
            reference_name=data.reference_name,
            reference_family_name=data.reference_family_name,
        )

        return await self.repository.upsert(proposal, auto_commit=True)

    async def check_proposal_exists(self, proposal_id: UUID) -> ReferenceProposal:
        result = await self.session.scalars(select(ReferenceProposal).where(ReferenceProposal.id == proposal_id))
        proposal = result.one_or_none()

        if not proposal:
            raise NotFoundException()

        return proposal

    async def refuse(
        self,
        judge_id: UUID,
        data: ReferenceProposalRefuse,
    ) -> None:
        self.check_proposal_exists(data.reference_proposal_id)

        await self.session.execute(
            update(ReferenceProposal)
            .where(ReferenceProposal.id == data.reference_proposal_id)
            .values(
                judge_id=judge_id,
                judged_at=datetime.now(timezone.utc),
                status=ReferenceProposalStatus.REFUSED,
                reason=data.reason,
            )
        )

        await self.session.flush()
        await self.session.commit()

    async def accept(
        self,
        judge_id: UUID,
        data: ReferenceProposalAccept,
    ) -> None:
        self.check_proposal_exists(data.reference_proposal_id)

        await self.session.execute(
            update(ReferenceProposal)
            .where(ReferenceProposal.id == data.reference_proposal_id)
            .values(
                judge_id=judge_id,
                judged_at=datetime.now(timezone.utc),
                status=ReferenceProposalStatus.VALIDATED,
            )
        )

        await self.session.execute(
            insert(FusionReference).values(
                fusion_id=data.fusion_id,
                reference_id=data.reference_id,
                reference_proposal_id=data.reference_proposal_id,
            )
        )

        await self.session.flush()
        await self.session.commit()


def use_postgres_reference_proposal_dependency(db_session: AsyncSession) -> ReferenceProposalDependency:
    return PostgresReferenceProposalDependency(db_session)
