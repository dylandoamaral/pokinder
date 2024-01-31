from datetime import datetime
from typing import Annotated, List, TYPE_CHECKING

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.dto import DTOConfig
from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_created_at_column
from src.component.fusion_creator import FusionCreator


class Creator(BaseTable, UUIDPrimaryKey):
    __tablename__ = "creator"  #  type: ignore[assignment]

    __table_args__ = (UniqueConstraint("name", name="creator_name_should_be_unique"),)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = build_created_at_column()


class CreatorRepository(SQLAlchemyAsyncRepository[Creator]):
    model_type = Creator


write_config = DTOConfig()
WriteDTO = SQLAlchemyDTO[Annotated[Creator, write_config]]


class ReadDTO(SQLAlchemyDTO[Creator]):
    config = DTOConfig(exclude={"created_at"})
