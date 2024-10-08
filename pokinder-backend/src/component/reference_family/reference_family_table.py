from datetime import datetime
from typing import Annotated

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.dto import DTOConfig
from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_created_at_column
from enum import Enum


class ReferenceFamily(BaseTable, UUIDPrimaryKey):
    __tablename__ = "reference_family"  #  type: ignore[assignment]

    __table_args__ = (UniqueConstraint("name", name="reference_family_name_should_be_unique"),)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = build_created_at_column()
