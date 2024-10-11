from datetime import datetime
from enum import Enum

from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.sqlalchemy import (
    BaseTable,
    UUIDPrimaryKey,
    build_created_at_column,
    private,
)


class AccountRole(Enum):
    USER = 0
    ADMIN = 1

    def stringify(self):
        return self.name.lower()


class Account(BaseTable, UUIDPrimaryKey):
    __tablename__ = "account"  #  type: ignore[assignment]

    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, info=private)
    password: Mapped[bytes] = mapped_column(nullable=False, info=private)
    role: Mapped[AccountRole] = mapped_column(nullable=False, default=AccountRole.USER)
    created_at: Mapped[datetime] = build_created_at_column()


class AccountRepository(SQLAlchemyAsyncRepository[Account]):
    model_type = Account
