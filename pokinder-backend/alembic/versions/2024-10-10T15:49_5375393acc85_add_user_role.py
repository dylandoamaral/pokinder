"""Add user role

Revision ID: 5375393acc85
Revises: 26ce77c6f57c
Create Date: 2024-10-10 15:49:36.232299

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "5375393acc85"
down_revision: Union[str, None] = "26ce77c6f57c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE TYPE accountrole AS ENUM ('USER', 'ADMIN');")
    op.add_column(
        "account",
        sa.Column("role", sa.Enum("USER", "ADMIN", name="accountrole"), nullable=False, server_default="USER"),
    )


def downgrade() -> None:
    op.drop_column("account", "role")
    op.execute("DROP TYPE accountrole;")
