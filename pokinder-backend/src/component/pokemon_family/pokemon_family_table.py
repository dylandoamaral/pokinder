from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey
from sqlalchemy import Column, Table


PokemonFamily = Table(
    "pokemon_family",
    BaseTable.metadata,
    Column("pokemon_id", ForeignKey("pokemon.id"), nullable=False),
    Column("family_id", ForeignKey("family.id"), nullable=False),
)
