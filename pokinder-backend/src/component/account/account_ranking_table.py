from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, Index, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey


class AccountRanking(BaseTable, UUIDPrimaryKey):
    __tablename__ = "account_ranking"  #  type: ignore[assignment]

    __table_args__ = (Index("index_account_ranking_rank", "rank"),)

    rank: Mapped[int] = mapped_column(Integer, nullable=False)
