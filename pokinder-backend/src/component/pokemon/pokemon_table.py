from datetime import datetime
from typing import Annotated, List

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.dto import DTOConfig
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.component.family.family_table import Family
from src.component.pokemon_family.pokemon_family_table import PokemonFamily
from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey, build_created_at_column


class Pokemon(BaseTable, UUIDPrimaryKey):
    __tablename__ = "pokemon"  #  type: ignore[assignment]

    name: Mapped[str] = mapped_column(String(50), nullable=False)
    type_1: Mapped[str] = mapped_column(String(20), nullable=False)
    type_2: Mapped[str] = mapped_column(String(20), nullable=True)
    name_separator_index: Mapped[str] = mapped_column(String(5), nullable=False)
    pokedex_id: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = build_created_at_column()

    families: Mapped[List[Family]] = relationship(secondary=PokemonFamily)


class PokemonRepository(SQLAlchemyAsyncRepository[Pokemon]):
    model_type = Pokemon


write_config = DTOConfig()
WriteDTO = SQLAlchemyDTO[Annotated[Pokemon, write_config]]
ReadDTO = SQLAlchemyDTO[Pokemon]
