from datetime import datetime
from enum import Enum
from typing import Annotated
from uuid import UUID

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.dto import DTOConfig
from sqlalchemy import ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.utils.sqlalchemy import BaseTable, build_date_column


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
    __table_args__ = (PrimaryKeyConstraint("account_id", "fusion_id", name="pk_account_fusion"),)

    account_id: Mapped[UUID]
    fusion_id: Mapped[UUID] = mapped_column(ForeignKey("fusion.id"))
    vote_type: Mapped[VoteType]
    created_at: Mapped[datetime] = build_date_column()

    fusion = relationship("Fusion")


class VoteRepository(SQLAlchemyAsyncRepository[Vote]):
    model_type = Vote


write_config = DTOConfig()


class WriteDTO(SQLAlchemyDTO[Annotated[Vote, write_config]]):
    config = DTOConfig(exclude={"fusion"})


class ReadDTO(SQLAlchemyDTO[Vote]):
    config = DTOConfig(
        exclude={
            "fusion_id",
            "fusion.creators",
            # "fusion.references",
        }
    )


class PostDTO(SQLAlchemyDTO[Vote]):
    config = DTOConfig(exclude={"fusion"})
