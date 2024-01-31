from datetime import datetime
from typing import Annotated, List, TYPE_CHECKING
from uuid import UUID

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.dto import DTOConfig
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.component.creator.creator_table import Creator
from src.component.fusion_creator import FusionCreator
from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_created_at_column


class Fusion(BaseTable, UUIDPrimaryKey):
    __tablename__ = "fusion"  #  type: ignore[assignment]

    path: Mapped[str] = mapped_column(nullable=False)
    is_removed: Mapped[bool] = mapped_column(nullable=False)
    head_id: Mapped[UUID] = mapped_column(ForeignKey("pokemon.id"))
    body_id: Mapped[UUID] = mapped_column(ForeignKey("pokemon.id"))
    created_at: Mapped[datetime] = build_created_at_column()
    commit_id: Mapped[str] = mapped_column(nullable=False, server_default="7f63a8312d59302d8c7e765526d7c18b4857c426")

    creators: Mapped[List[Creator]] = relationship(secondary=FusionCreator)

    head = relationship("Pokemon", foreign_keys=[head_id])
    body = relationship("Pokemon", foreign_keys=[body_id])


class FusionRepository(SQLAlchemyAsyncRepository[Fusion]):
    model_type = Fusion


write_config = DTOConfig()
WriteDTO = SQLAlchemyDTO[Annotated[Fusion, write_config]]
ReadDTO = SQLAlchemyDTO[Fusion]
