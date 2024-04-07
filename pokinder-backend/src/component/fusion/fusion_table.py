from datetime import datetime
from typing import List
from uuid import UUID

from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.component.creator.creator_table import Creator
from src.component.fusion_creator import FusionCreator
from src.utils.sqlalchemy import (
    BaseTable,
    UUIDPrimaryKey,
    build_created_at_column,
    private,
    read_only,
    write_only,
)


class Fusion(BaseTable, UUIDPrimaryKey):
    __tablename__ = "fusion"  #  type: ignore[assignment]

    path: Mapped[str] = mapped_column(nullable=False)
    head_id: Mapped[UUID] = mapped_column(ForeignKey("pokemon.id"), info=write_only)
    body_id: Mapped[UUID] = mapped_column(ForeignKey("pokemon.id"), info=write_only)
    vote_score: Mapped[int] = mapped_column(nullable=False, server_default="0", info=read_only)
    vote_count: Mapped[int] = mapped_column(nullable=False, server_default="0", info=read_only)
    created_at: Mapped[datetime] = build_created_at_column()
    commit_id: Mapped[str] = mapped_column(
        nullable=False,
        server_default="7f63a8312d59302d8c7e765526d7c18b4857c426",
        info=private,
    )
    is_removed: Mapped[bool] = mapped_column(nullable=False, info=private)

    creators: Mapped[List[Creator]] = relationship(secondary=FusionCreator, info=read_only)
    head = relationship("Pokemon", foreign_keys=[head_id], info=read_only)
    body = relationship("Pokemon", foreign_keys=[body_id], info=read_only)


class FusionRepository(SQLAlchemyAsyncRepository[Fusion]):
    model_type = Fusion
