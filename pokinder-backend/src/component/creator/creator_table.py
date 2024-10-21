from datetime import datetime

from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_created_at_column


class Creator(BaseTable, UUIDPrimaryKey):
    __tablename__ = "creator"  #  type: ignore[assignment]

    __table_args__ = (UniqueConstraint("name", name="creator_name_should_be_unique"),)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = build_created_at_column()


class CreatorRepository(SQLAlchemyAsyncRepository[Creator]):
    model_type = Creator
