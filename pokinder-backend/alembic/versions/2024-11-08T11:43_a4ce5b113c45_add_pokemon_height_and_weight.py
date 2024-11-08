"""Add pokemon height and weight

Revision ID: a4ce5b113c45
Revises: cb9567a5a9ad
Create Date: 2024-11-08 11:43:30.369828

"""

from typing import Sequence, Union

import requests
import sqlalchemy as sa

from alembic import op

connection = op.get_bind()

# revision identifiers, used by Alembic.
revision: str = "a4ce5b113c45"
down_revision: Union[str, None] = "cb9567a5a9ad"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("pokemon", sa.Column("height", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("pokemon", sa.Column("weight", sa.Integer(), nullable=False, server_default="0"))

    result = connection.execute(sa.text("SELECT name FROM pokemon")).fetchall()

    update_data = []

    for row in result:
        pokemon_name = row.name

        api_pokemon_name = (
            pokemon_name.lower()
            .replace(" ", "-")
            .replace(".", "")
            .replace("'", "")
            .replace("♀", "-f")
            .replace("♂", "-m")
            .replace("-style", "")
            .replace("-form", "")
        )

        if api_pokemon_name == "aegislash":
            api_pokemon_name = "aegislash-shield"
        if api_pokemon_name == "giratina":
            api_pokemon_name = "giratina-altered"
        if api_pokemon_name == "mimikyu":
            api_pokemon_name = "mimikyu-disguised"
        if api_pokemon_name == "deoxys":
            api_pokemon_name = "deoxys-normal"

        response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{api_pokemon_name}")

        if response.status_code == 200:
            pokemon_data = response.json()

            weight = pokemon_data.get("weight")
            height = pokemon_data.get("height")

            update_data.append({"name": pokemon_name, "weight": weight, "height": height})
        else:
            print(f"Failed to retrieve data for Pokémon '{pokemon_name}'")

    if update_data:
        connection.execute(
            sa.text("UPDATE pokemon SET weight = :weight, height = :height WHERE name = :name"), update_data
        )


def downgrade() -> None:
    op.drop_column("pokemon", "weight")
    op.drop_column("pokemon", "height")
