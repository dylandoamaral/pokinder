from datetime import datetime
from typing import Annotated, List

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.dto import DTOConfig
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_created_at_column


class Account(BaseTable, UUIDPrimaryKey):
    __tablename__ = "account"  #  type: ignore[assignment]

    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    password: Mapped[bytes] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = build_created_at_column()


class AccountRepository(SQLAlchemyAsyncRepository[Account]):
    model_type = Account


write_config = DTOConfig()
WriteDTO = SQLAlchemyDTO[Annotated[Account, write_config]]
ReadDTO = SQLAlchemyDTO[Account]
