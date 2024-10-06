from datetime import datetime
from typing import TYPE_CHECKING, Annotated, List
from uuid import UUID

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.dto import DTOConfig
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.component.creator.creator_table import Creator
from src.component.fusion_creator import FusionCreator

from src.component.fusion_reference.fusion_reference_table import FusionReference
from src.component.reference.reference_table import Reference
from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_date_column


class Fusion(BaseTable, UUIDPrimaryKey):
    __tablename__ = "fusion"  #  type: ignore[assignment]

    path: Mapped[str] = mapped_column(nullable=False)
    is_removed: Mapped[bool] = mapped_column(nullable=False)
    head_id: Mapped[UUID] = mapped_column(ForeignKey("pokemon.id"))
    body_id: Mapped[UUID] = mapped_column(ForeignKey("pokemon.id"))
    created_at: Mapped[datetime] = build_date_column()
    commit_id: Mapped[str] = mapped_column(nullable=False, server_default="7f63a8312d59302d8c7e765526d7c18b4857c426")
    vote_score: Mapped[int] = mapped_column(nullable=False, server_default="0")
    vote_count: Mapped[int] = mapped_column(nullable=False, server_default="0")

    creators: Mapped[List[Creator]] = relationship(secondary=FusionCreator)
    references: Mapped[List[Reference]] = relationship(secondary=FusionReference)

    head = relationship("Pokemon", foreign_keys=[head_id])
    body = relationship("Pokemon", foreign_keys=[body_id])


class FusionRepository(SQLAlchemyAsyncRepository[Fusion]):
    model_type = Fusion


write_config = DTOConfig()
WriteDTO = SQLAlchemyDTO[Annotated[Fusion, write_config]]

read_config = DTOConfig(
    max_nested_depth=2,
    exclude=[
        "head.families",
        "body.families",
    ],
)
ReadDTO = SQLAlchemyDTO[Annotated[Fusion, read_config]]
