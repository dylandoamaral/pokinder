"""Application ORM configuration."""
from __future__ import annotations

import re
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, Any, ClassVar
from uuid import UUID, uuid4

from litestar.contrib.sqlalchemy.types import GUID, DateTimeUTC, JsonB
from pydantic import AnyHttpUrl, AnyUrl, BaseModel, EmailStr
from sqlalchemy import Date, MetaData, String
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    declared_attr,
    mapped_column,
    registry,
)

if TYPE_CHECKING:
    from sqlalchemy.sql import FromClause

convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}
"""Templates for automated constraint name generation."""


class UUIDPrimaryKey:
    id: Mapped[UUID] = mapped_column(default=uuid4, primary_key=True)  # pyright: ignore


class CommonTableAttributes:
    """Common attributes for SQLALchemy tables."""

    __name__: ClassVar[str]
    __table__: FromClause

    # noinspection PyMethodParameters
    @declared_attr.directive
    def __tablename__(cls) -> str:
        """Infer table name from class name."""
        regexp = re.compile("((?<=[a-z0-9])[A-Z]|(?!^)[A-Z](?=[a-z]))")
        return regexp.sub(r"_\1", cls.__name__).lower()

    def to_dict(self, exclude: set[str] | None = None) -> dict[str, Any]:
        """Convert model to dictionary.

        Returns:
            dict[str, Any]: A dict representation of the model
        """
        exclude = {"sa_orm_sentinel", "_sentinel"}.union(self._sa_instance_state.unloaded).union(exclude or [])  # type: ignore[attr-defined]
        return {field.name: getattr(self, field.name) for field in self.__table__.columns if field.name not in exclude}


def create_registry() -> registry:
    """Create a new SQLAlchemy registry."""
    meta = MetaData(naming_convention=convention)  # type: ignore[arg-type]
    return registry(
        metadata=meta,
        type_annotation_map={
            UUID: GUID,
            EmailStr: String,
            AnyUrl: String,
            AnyHttpUrl: String,
            dict: JsonB,
            datetime: DateTimeUTC,
            date: Date,
        },
    )


orm_registry = create_registry()


class BaseTable(CommonTableAttributes, DeclarativeBase):
    """Base for all SQLAlchemy declarative models with UUID primary keys."""

    registry = orm_registry


def build_created_at_column() -> Mapped[datetime]:
    return mapped_column(  # pyright: ignore
        DateTimeUTC(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
