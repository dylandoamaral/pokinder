from sqlalchemy import insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from litestar.exceptions import NotFoundException, MethodNotAllowedException
from datetime import datetime
from typing import Optional

from src.component.fusion_reference.fusion_reference_table import FusionReference
from src.component.reference.reference_table import Reference
from src.component.reference_family import ReferenceFamily

from .reference_proposal_dependency import ReferenceProposalDependency
from .reference_proposal_table import (
    ReferenceProposal,
    ReferenceProposalRepository,
    ReferenceProposalChoice,
    ReferenceProposalStatus,
)
from .reference_proposal_model import ReferenceProposalAdd


class PostgresReferenceProposalDependency(ReferenceProposalDependency):
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = ReferenceProposalRepository(session=session)

    async def list(self) -> list[ReferenceProposal]:
        query = select(ReferenceProposal)

        result = await self.session.scalars(query)
        instances = result.all()

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

    async def modify(
        self,
        proposal_id: UUID,
        maybe_reference_name: Optional[str],
        maybe_reference_source: Optional[str],
        maybe_reference_family_name: Optional[str],
    ) -> None:
        proposal = self.check_proposal_exists(proposal_id)

        if proposal.status != ReferenceProposalStatus.PENDING:
            raise MethodNotAllowedException()

        update_values = {}

        if maybe_reference_name is not None:
            update_values["reference_name"] = maybe_reference_name
        if maybe_reference_source is not None:
            update_values["reference_source"] = maybe_reference_source
        if maybe_reference_family_name is not None:
            update_values["reference_family_name"] = maybe_reference_family_name

        await self.session.execute(
            update(ReferenceProposal).where(ReferenceProposal.id == proposal_id).values(update_values)
        )

        await self.session.flush()
        await self.session.commit()

    async def judge(
        self,
        judge_id: UUID,
        proposal_id: UUID,
        proposal_choice: ReferenceProposalChoice,
    ) -> None:
        proposal = self.check_proposal_exists(proposal_id)

        reference_family = await self.session.scalars(
            select(ReferenceFamily).where(ReferenceFamily.name == proposal.reference_family_name)
        )

        if not reference_family:
            raise NotFoundException()

        maybe_reference = await self.session.scalars(
            select(Reference).where(
                Reference.name == proposal.reference_name, Reference.family_id == reference_family.id
            )
        )

        if maybe_reference:
            await insert(FusionReference).values(
                fusion_id=proposal.fusion_id,
                reference_id=maybe_reference.id,
            )
        else:
            new_reference_id = await (
                insert(Reference)
                .values(
                    name=proposal.reference_name,
                    source=proposal.reference_source,
                    family_id=reference_family.id,
                    created_at=datetime.now(),
                )
                .returning(Reference.id)
            )

            await insert(FusionReference).values(
                fusion_id=proposal.fusion_id,
                reference_id=new_reference_id,
            )

        await self.session.execute(
            update(ReferenceProposal)
            .where(ReferenceProposal.id == proposal_id)
            .values(
                judge_id=judge_id,
                judged_at=datetime.now(),
                status=proposal_choice.to_status(),
            )
        )

        await self.session.flush()
        await self.session.commit()


def use_postgres_reference_proposal_dependency(db_session: AsyncSession) -> ReferenceProposalDependency:
    return PostgresReferenceProposalDependency(db_session)
