from datetime import datetime
from uuid import UUID

from sqlalchemy import ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.component.reference_family import ReferenceFamily
from src.utils.sqlalchemy import (
    BaseTable,
    UUIDPrimaryKey,
    build_created_at_column,
    read_only,
    write_only,
)


class Reference(BaseTable, UUIDPrimaryKey):
    __tablename__ = "reference"  #  type: ignore[assignment]

    __table_args__ = (
        UniqueConstraint("name", "family_id", name="reference_name_family_id_should_be_unique"),
        Index("index_reference_name", "name"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source: Mapped[str] = mapped_column(nullable=True)
    family_id: Mapped[UUID] = mapped_column(ForeignKey("reference_family.id"), info=write_only)
    created_at: Mapped[datetime] = build_created_at_column()

    family: Mapped[ReferenceFamily] = relationship("ReferenceFamily", foreign_keys=[family_id], info=read_only)
