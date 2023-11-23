from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey


class Family(BaseTable, UUIDPrimaryKey):
    __tablename__ = "family"  #  type: ignore[assignment]

    name: Mapped[str] = mapped_column(String(50), nullable=False)
