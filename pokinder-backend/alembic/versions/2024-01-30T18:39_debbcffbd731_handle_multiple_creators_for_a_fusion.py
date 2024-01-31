"""Handle multiple creators for a fusion

Revision ID: debbcffbd731
Revises: 088d3e1f3ad7
Create Date: 2024-01-30 18:39:17.939943

"""
from typing import Sequence, Union
from uuid import uuid4

import litestar
import sqlalchemy as sa
from sqlalchemy import text

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "debbcffbd731"
down_revision: Union[str, None] = "088d3e1f3ad7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

connection = op.get_bind()


def upgrade() -> None:
    fusion_creator_table = op.create_table(
        "fusion_creator",
        sa.Column("fusion_id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.Column("creator_id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.ForeignKeyConstraint(["creator_id"], ["creator.id"], name=op.f("fk_fusion_creator_creator_id_creator")),
        sa.ForeignKeyConstraint(["fusion_id"], ["fusion.id"], name=op.f("fk_fusion_creator_fusion_id_fusion")),
    )

    result = connection.execute(
        text(
            "SELECT fusion.id, fusion.creator_id, creator.name FROM fusion JOIN creator ON fusion.creator_id = creator.id"
        )
    )

    rows = result.fetchall()

    # Mapping from creator name to creator id
    creator_mapping = dict()
    # List of fusions containing multiple creators
    fusions_with_multiple_creators = []
    # List of fusion creator to insert
    fusion_creator_values = []

    for fusion_id, creator_id, creator_name in rows:
        maybe_separator = get_multiple_creators_separator(creator_name)
        if maybe_separator is not None:
            creator_names = creator_name.split(maybe_separator)
            fusions_with_multiple_creators.append((fusion_id, creator_names))
        else:
            creator_mapping[creator_name] = creator_id
            fusion_creator_values.append({"fusion_id": fusion_id, "creator_id": creator_id})

    for fusion_id, creator_names in fusions_with_multiple_creators:
        for creator_name in creator_names:
            if creator_name in creator_mapping:
                creator_id = creator_mapping[creator_name]
                fusion_creator_values.append({"fusion_id": fusion_id, "creator_id": creator_id})
            else:
                creator_id = retrieve_creator_id_from_name(creator_name)
                creator_mapping[creator_name] = creator_id
                fusion_creator_values.append({"fusion_id": fusion_id, "creator_id": creator_id})

    print(f"Inserting {len(fusion_creator_values)} mapping.")

    op.bulk_insert(fusion_creator_table, fusion_creator_values)


def retrieve_creator_id_from_name(creator_name):
    result = connection.execute(text(f"SELECT id FROM creator WHERE name = '{creator_name}'"))

    maybe_row = result.first()

    if maybe_row:
        return maybe_row[0]
    else:
        creator_id = uuid4()
        print(f"Create new creator named {creator_name} with id {creator_id}")
        op.execute(text(f"INSERT INTO creator (name, id, created_at) VALUES ('{creator_name}', '{creator_id}', NOW())"))
        return creator_id


def get_multiple_creators_separator(string):
    substrings = [" & ", " and ", " / "]
    for substring in substrings:
        if substring in string:
            return substring
    return None


def downgrade() -> None:
    op.drop_table("fusion_creator")
