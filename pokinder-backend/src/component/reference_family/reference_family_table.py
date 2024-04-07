from datetime import datetime
from typing import Annotated

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.dto import DTOConfig
from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_date_column
from enum import Enum


class ReferenceFamilyColor(Enum):
    BLUE = 0
    RED = 1
    GREEN = 2
    ORANGE = 3
    PURPLE = 4
    YELLOW = 5
    PINK = 6


class ReferenceFamily(BaseTable, UUIDPrimaryKey):
    __tablename__ = "reference_family"  #  type: ignore[assignment]

    __table_args__ = (UniqueConstraint("name", name="reference_family_name_should_be_unique"),)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    color: Mapped[ReferenceFamilyColor] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = build_date_column()


class ReferenceFamilyRepository(SQLAlchemyAsyncRepository[ReferenceFamily]):
    model_type = ReferenceFamily


write_config = DTOConfig()
WriteDTO = SQLAlchemyDTO[Annotated[ReferenceFamily, write_config]]


class ReadDTO(SQLAlchemyDTO[ReferenceFamily]):
    config = DTOConfig(exclude={"created_at"})
