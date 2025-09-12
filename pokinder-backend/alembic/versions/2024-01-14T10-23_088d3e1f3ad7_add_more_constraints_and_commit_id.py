"""Add more constraints and commit id

Revision ID: 088d3e1f3ad7
Revises: f23b683c37a7
Create Date: 2024-01-14 10:23:34.233202

"""
from typing import Sequence, Union

import litestar
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "088d3e1f3ad7"
down_revision: Union[str, None] = "f23b683c37a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "creator",
        "name",
        existing_type=sa.VARCHAR(length=50),
        type_=sa.String(length=255),
        existing_nullable=False,
    )
    op.add_column(
        "fusion",
        sa.Column(
            "commit_id",
            sa.String(),
            server_default="7f63a8312d59302d8c7e765526d7c18b4857c426",
            nullable=False,
        ),
    )
    op.create_unique_constraint("creator_name_should_be_unique", "creator", ["name"])
    op.create_unique_constraint("pokemom_name_should_be_unique", "pokemon", ["name"])
    op.create_unique_constraint("pokemon_pokedex_id_should_be_unique", "pokemon", ["pokedex_id"])


def downgrade() -> None:
    op.drop_constraint("pokemon_pokedex_id_should_be_unique", "pokemon", type_="unique")
    op.drop_constraint("pokemom_name_should_be_unique", "pokemon", type_="unique")
    op.drop_constraint("creator_name_should_be_unique", "creator", type_="unique")
    op.drop_column("fusion", "commit_id")
    op.alter_column(
        "creator",
        "name",
        existing_type=sa.String(length=255),
        type_=sa.VARCHAR(length=50),
        existing_nullable=False,
    )
