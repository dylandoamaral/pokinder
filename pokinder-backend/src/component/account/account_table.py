from datetime import datetime

from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.sqlalchemy import (
    BaseTable,
    UUIDPrimaryKey,
    build_created_at_column,
    private,
)


class Account(BaseTable, UUIDPrimaryKey):
    __tablename__ = "account"  #  type: ignore[assignment]

    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, info=private)
    password: Mapped[bytes] = mapped_column(nullable=False, info=private)
    created_at: Mapped[datetime] = build_created_at_column()


class AccountRepository(SQLAlchemyAsyncRepository[Account]):
    model_type = Account
