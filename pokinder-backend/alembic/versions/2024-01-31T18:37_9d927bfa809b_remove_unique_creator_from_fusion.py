"""Remove unique creator from fusion

Revision ID: 9d927bfa809b
Revises: debbcffbd731
Create Date: 2024-01-31 18:37:05.568818

"""
from typing import Sequence, Union

import litestar
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9d927bfa809b"
down_revision: Union[str, None] = "debbcffbd731"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("fk_fusion_creator_id_creator", "fusion", type_="foreignkey")
    op.drop_column("fusion", "creator_id")


def downgrade() -> None:
    op.add_column("fusion", sa.Column("creator_id", sa.UUID(), autoincrement=False, nullable=False))
    op.create_foreign_key("fk_fusion_creator_id_creator", "fusion", "creator", ["creator_id"], ["id"])
