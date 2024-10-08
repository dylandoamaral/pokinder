from datetime import datetime
from uuid import UUID

from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_created_at_column, private, write_only, read_only
from enum import Enum


class ReferenceProposalStatus(Enum):
    PENDING = 0
    VALIDATED = 1
    REFUSED = 2


class ReferenceProposal(BaseTable, UUIDPrimaryKey):
    __tablename__ = "reference_proposal"  #  type: ignore[assignment]

    reference_name: Mapped[str] = mapped_column(String(255), nullable=False)
    reference_family_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[ReferenceProposalStatus] = mapped_column(nullable=False)
    fusion_id: Mapped[UUID] = mapped_column(ForeignKey("fusion.id"), nullable=False, info=write_only)
    proposer_id: Mapped[UUID] = mapped_column(ForeignKey("account.id"), nullable=False, info=write_only)
    judge_id: Mapped[UUID] = mapped_column(ForeignKey("account.id"), nullable=True, info=write_only)
    judged_at: Mapped[datetime] = build_created_at_column(nullable=True)
    reason: Mapped[str] = mapped_column(String(1023), nullable=True)
    created_at: Mapped[datetime] = build_created_at_column(nullable=False)

    fusion = relationship("Fusion", lazy="joined", foreign_keys=[fusion_id], info=read_only)
    proposer = relationship("Account", lazy="joined", foreign_keys=[proposer_id], info=read_only)
    judge = relationship("Account", lazy="noload", foreign_keys=[judge_id], info=private)


class ReferenceProposalRepository(SQLAlchemyAsyncRepository[ReferenceProposal]):
    model_type = ReferenceProposal
