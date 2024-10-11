"""Add fusion_reference unique constraint

Revision ID: 94256a9f3302
Revises: 5375393acc85
Create Date: 2024-10-11 14:35:35.463828

"""

from typing import Sequence, Union

from alembic import op


revision: str = "94256a9f3302"
down_revision: Union[str, None] = "5375393acc85"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint(
        "fusion_id_reference_id_should_be_unique",
        "fusion_reference",
        ["fusion_id", "reference_id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fusion_id_reference_id_should_be_unique",
        "fusion_reference",
        type_="unique",
    )
