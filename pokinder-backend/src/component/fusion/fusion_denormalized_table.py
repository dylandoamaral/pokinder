from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, Index, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.sqlalchemy import BaseTable, UUIDPrimaryKey


class FusionDenormalized(BaseTable, UUIDPrimaryKey):
    __tablename__ = "fusion_denormalized"  #  type: ignore[assignment]

    __table_args__ = (
        Index("index_fusion_denormalized_path", "path"),
        Index("index_fusion_denormalized_vote_count", "vote_count"),
        Index("index_fusion_denormalized_creators_gin", "creators", postgresql_using="gin"),
        Index("index_fusion_denormalized_references_gin", "references", postgresql_using="gin"),
        Index("index_fusion_denormalized_head_families_gin", "head_families", postgresql_using="gin"),
        Index("index_fusion_denormalized_body_families_gin", "body_families", postgresql_using="gin"),
    )

    path: Mapped[str] = mapped_column(String(15), nullable=False)
    vote_count: Mapped[int] = mapped_column(Integer, nullable=False)
    vote_score: Mapped[Numeric] = mapped_column(Numeric, nullable=False)
    is_removed: Mapped[bool] = mapped_column(Boolean, nullable=False)

    head_name: Mapped[str] = mapped_column(String(100), nullable=False)
    head_name_separator_index: Mapped[str] = mapped_column(String(10), nullable=False)
    head_type_1: Mapped[str] = mapped_column(String(20), nullable=False)
    head_type_2: Mapped[str] = mapped_column(String(20), nullable=True)
    head_height: Mapped[int] = mapped_column(nullable=False)
    head_weight: Mapped[int] = mapped_column(nullable=False)
    head_pokedex_id: Mapped[int] = mapped_column(nullable=False)
    head_families: Mapped[list] = mapped_column(JSONB, nullable=False)

    body_name: Mapped[str] = mapped_column(String(100), nullable=False)
    body_name_separator_index: Mapped[str] = mapped_column(String(10), nullable=False)
    body_type_1: Mapped[str] = mapped_column(String(20), nullable=False)
    body_type_2: Mapped[str] = mapped_column(String(20), nullable=True)
    body_height: Mapped[int] = mapped_column(nullable=False)
    body_weight: Mapped[int] = mapped_column(nullable=False)
    body_pokedex_id: Mapped[int] = mapped_column(nullable=False)
    body_families: Mapped[list] = mapped_column(JSONB, nullable=False)

    creators: Mapped[list] = mapped_column(JSONB, nullable=False)
    references: Mapped[list] = mapped_column(JSONB, nullable=False)
