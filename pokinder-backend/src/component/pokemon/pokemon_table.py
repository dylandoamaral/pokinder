from datetime import datetime
from typing import List

from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.component.family.family_table import Family
from src.component.pokemon_family.pokemon_family_table import PokemonFamily
from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_created_at_column


class Pokemon(BaseTable, UUIDPrimaryKey):
    __tablename__ = "pokemon"  #  type: ignore[assignment]

    __table_args__ = (
        UniqueConstraint("pokedex_id", name="pokemon_pokedex_id_should_be_unique"),
        UniqueConstraint("name", name="pokemom_name_should_be_unique"),
    )

    name: Mapped[str] = mapped_column(String(50), nullable=False)
    type_1: Mapped[str] = mapped_column(String(20), nullable=False)
    type_2: Mapped[str] = mapped_column(String(20), nullable=True)
    height: Mapped[int] = mapped_column(nullable=False)
    weight: Mapped[int] = mapped_column(nullable=False)
    name_separator_index: Mapped[str] = mapped_column(String(5), nullable=False)
    pokedex_id: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = build_created_at_column()

    families: Mapped[List[Family]] = relationship(secondary=PokemonFamily)
