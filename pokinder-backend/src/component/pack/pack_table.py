from datetime import datetime
from typing import Annotated
from uuid import UUID

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.dto import DTOConfig
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_created_at_column


class Pack(BaseTable, UUIDPrimaryKey):
    __tablename__ = "pack"  #  type: ignore[assignment]

    name: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = build_created_at_column()


class PackRepository(SQLAlchemyAsyncRepository[Pack]):
    model_type = Pack


write_config = DTOConfig()
WriteDTO = SQLAlchemyDTO[Annotated[Pack, write_config]]
ReadDTO = SQLAlchemyDTO[Pack]
