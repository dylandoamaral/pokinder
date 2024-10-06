from datetime import datetime
from typing import Annotated
from uuid import UUID

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.dto import DTOConfig
from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_date_column
from enum import Enum


class ReferenceProposalChoice(Enum):
    VALIDATED = 0
    REFUSED = 1

    def to_status(self):
        if self == ReferenceProposalChoice.VALIDATED:
            return ReferenceProposalStatus.VALIDATED
        elif self == ReferenceProposalChoice.REFUSED:
            return ReferenceProposalStatus.REFUSED
        else:
            raise ValueError("Invalid choice")


class ReferenceProposalStatus(Enum):
    PENDING = 0
    VALIDATED = 1
    REFUSED = 2


class ReferenceProposal(BaseTable, UUIDPrimaryKey):
    __tablename__ = "reference_proposal"  #  type: ignore[assignment]

    reference_name: Mapped[str] = mapped_column(String(255), nullable=False)
    reference_family_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[ReferenceProposalStatus] = mapped_column(nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    fusion_id: Mapped[UUID] = mapped_column(ForeignKey("fusion.id"), nullable=False)
    proposer_id: Mapped[UUID] = mapped_column(ForeignKey("account.id"), nullable=False)
    judge_id: Mapped[UUID] = mapped_column(ForeignKey("account.id"), nullable=True)
    judged_at: Mapped[datetime] = build_date_column(nullable=True)
    created_at: Mapped[datetime] = build_date_column(nullable=False)

    fusion = relationship("Fusion", foreign_keys=[fusion_id])
    proposer = relationship("Account", foreign_keys=[proposer_id])
    judge = relationship("Account", foreign_keys=[judge_id])


class ReferenceProposalRepository(SQLAlchemyAsyncRepository[ReferenceProposal]):
    model_type = ReferenceProposal


write_config = DTOConfig()
WriteDTO = SQLAlchemyDTO[Annotated[ReferenceProposal, write_config]]


class ReadDTO(SQLAlchemyDTO[ReferenceProposal]):
    config = DTOConfig(exclude={"created_at", "judged_at"})


class PostDTO(SQLAlchemyDTO[ReferenceProposal]):
    config = DTOConfig(exclude={"fusion", "proposer", "judge"})
