from datetime import datetime

from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_created_at_column


class ReferenceFamily(BaseTable, UUIDPrimaryKey):
    __tablename__ = "reference_family"  #  type: ignore[assignment]

    __table_args__ = (UniqueConstraint("name", name="reference_family_name_should_be_unique"),)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = build_created_at_column()
