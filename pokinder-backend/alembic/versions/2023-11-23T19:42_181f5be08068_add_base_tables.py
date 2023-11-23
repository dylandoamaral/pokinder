"""Add base tables

Revision ID: 181f5be08068
Revises: 
Create Date: 2023-11-23 19:42:39.716559

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import litestar


# revision identifiers, used by Alembic.
revision: str = "181f5be08068"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "creator",
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("created_at", litestar.contrib.sqlalchemy.types.DateTimeUTC(timezone=True), nullable=False),
        sa.Column("id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_creator")),
    )
    op.create_table(
        "family",
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_family")),
    )
    op.create_table(
        "pokemon",
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("type_1", sa.String(length=20), nullable=False),
        sa.Column("type_2", sa.String(length=20), nullable=True),
        sa.Column("name_separator_index", sa.String(length=5), nullable=False),
        sa.Column("pokedex_id", sa.Integer(), nullable=False),
        sa.Column("created_at", litestar.contrib.sqlalchemy.types.DateTimeUTC(timezone=True), nullable=False),
        sa.Column("id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_pokemon")),
    )
    op.create_table(
        "fusion",
        sa.Column("path", sa.String(), nullable=False),
        sa.Column("is_removed", sa.Boolean(), nullable=False),
        sa.Column("creator_id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.Column("head_id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.Column("body_id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.Column("created_at", litestar.contrib.sqlalchemy.types.DateTimeUTC(timezone=True), nullable=False),
        sa.Column("id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.ForeignKeyConstraint(["body_id"], ["pokemon.id"], name=op.f("fk_fusion_body_id_pokemon")),
        sa.ForeignKeyConstraint(["creator_id"], ["creator.id"], name=op.f("fk_fusion_creator_id_creator")),
        sa.ForeignKeyConstraint(["head_id"], ["pokemon.id"], name=op.f("fk_fusion_head_id_pokemon")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_fusion")),
    )
    op.create_table(
        "pokemon_family",
        sa.Column("pokemon_id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.Column("family_id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.ForeignKeyConstraint(["family_id"], ["family.id"], name=op.f("fk_pokemon_family_family_id_family")),
        sa.ForeignKeyConstraint(["pokemon_id"], ["pokemon.id"], name=op.f("fk_pokemon_family_pokemon_id_pokemon")),
    )
    op.create_table(
        "vote",
        sa.Column("account_id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.Column("fusion_id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.Column("vote_type", sa.Enum("LIKED", "DISLIKED", "FAVORITE", name="votetype"), nullable=False),
        sa.Column("created_at", litestar.contrib.sqlalchemy.types.DateTimeUTC(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["fusion_id"], ["fusion.id"], name=op.f("fk_vote_fusion_id_fusion")),
        sa.PrimaryKeyConstraint("account_id", "fusion_id", name="pk_account_fusion"),
    )


def downgrade() -> None:
    op.drop_table("vote")
    op.drop_table("pokemon_family")
    op.drop_table("fusion")
    op.drop_table("pokemon")
    op.drop_table("family")
    op.drop_table("creator")
    op.execute("DROP TYPE votetype;")
