from datetime import datetime
from typing import Annotated
from uuid import UUID

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.dto import DTOConfig
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_created_at_column


class Fusion(BaseTable, UUIDPrimaryKey):
    __tablename__ = "fusion"  #  type: ignore[assignment]

    path: Mapped[str]
    pack_id: Mapped[UUID] = mapped_column(ForeignKey("pack.id"))
    creator_id: Mapped[UUID] = mapped_column(ForeignKey("creator.id"))
    head_id: Mapped[UUID] = mapped_column(ForeignKey("pokemon.id"))
    body_id: Mapped[UUID] = mapped_column(ForeignKey("pokemon.id"))
    created_at: Mapped[datetime] = build_created_at_column()

    pack = relationship("Pack")
    creator = relationship("Creator")
    head = relationship("Pokemon", foreign_keys=[head_id])
    body = relationship("Pokemon", foreign_keys=[body_id])


class FusionRepository(SQLAlchemyAsyncRepository[Fusion]):
    model_type = Fusion


write_config = DTOConfig()
WriteDTO = SQLAlchemyDTO[Annotated[Fusion, write_config]]
ReadDTO = SQLAlchemyDTO[Fusion]
