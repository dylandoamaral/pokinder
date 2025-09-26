from datetime import datetime
from enum import Enum
from uuid import UUID

from sqlalchemy import ForeignKey, Index, PrimaryKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.utils.sqlalchemy import (
    BaseTable,
    build_created_at_column,
    read_only,
    write_only,
)


class VoteType(Enum):
    LIKED = 0
    DISLIKED = 1
    FAVORITE = 2

    def to_score(self):
        if self == VoteType.LIKED:
            return 100
        elif self == VoteType.DISLIKED:
            return 0
        elif self == VoteType.FAVORITE:
            return 200
        else:
            raise ValueError("Invalid vote type")


class Vote(BaseTable):
    __tablename__ = "vote"  #  type: ignore[assignment]

    __table_args__ = (
        PrimaryKeyConstraint("account_id", "fusion_id", name="pk_account_fusion"),
        # NOTE: Used for many joins between vote and fusion tables.
        Index("index_vote_account_id_fusion_id", "account_id", "fusion_id"),
    )

    account_id: Mapped[UUID] = mapped_column(nullable=False)
    fusion_id: Mapped[UUID] = mapped_column(ForeignKey("fusion.id"), nullable=False, info=write_only)
    vote_type: Mapped[VoteType] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = build_created_at_column()

    fusion = relationship("Fusion", lazy="joined", info=read_only)
