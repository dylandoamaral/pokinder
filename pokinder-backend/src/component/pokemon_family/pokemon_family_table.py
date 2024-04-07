from uuid import UUID

from sqlalchemy import Column, ForeignKey, Table

from src.utils.sqlalchemy import BaseTable

PokemonFamily = Table(
    "pokemon_family",
    BaseTable.metadata,
    Column("pokemon_id", ForeignKey("pokemon.id"), nullable=False),
    Column("family_id", ForeignKey("family.id"), nullable=False),
)
