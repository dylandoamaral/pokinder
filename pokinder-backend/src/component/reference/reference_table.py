from datetime import datetime
from typing import TYPE_CHECKING, Annotated, List
from uuid import UUID

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.dto import DTOConfig
from sqlalchemy import String, UniqueConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_created_at_column
from src.component.reference_family import ReferenceFamily


class Reference(BaseTable, UUIDPrimaryKey):
    __tablename__ = "reference"  #  type: ignore[assignment]

    __table_args__ = (UniqueConstraint("name", "family_id", name="reference_name_family_id_should_be_unique"),)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source: Mapped[str] = mapped_column(nullable=True)
    family_id: Mapped[UUID] = mapped_column(ForeignKey("reference_family.id"))
    created_at: Mapped[datetime] = build_created_at_column()

    family: Mapped[ReferenceFamily] = relationship("ReferenceFamily", foreign_keys=[family_id])


class ReferenceRepository(SQLAlchemyAsyncRepository[Reference]):
    model_type = Reference


write_config = DTOConfig()
WriteDTO = SQLAlchemyDTO[Annotated[Reference, write_config]]


class ReadDTO(SQLAlchemyDTO[Reference]):
    config = DTOConfig(exclude={"created_at", "family_id"})
