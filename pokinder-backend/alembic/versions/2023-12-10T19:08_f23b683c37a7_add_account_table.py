"""Add account table

Revision ID: f23b683c37a7
Revises: 181f5be08068
Create Date: 2023-12-10 19:08:59.044546

"""
from typing import Sequence, Union

import litestar
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f23b683c37a7"
down_revision: Union[str, None] = "181f5be08068"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "account",
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("password", sa.LargeBinary(), nullable=False),
        sa.Column("created_at", litestar.contrib.sqlalchemy.types.DateTimeUTC(timezone=True), nullable=False),
        sa.Column("id", litestar.contrib.sqlalchemy.types.GUID(length=16), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_account")),
        sa.UniqueConstraint("email", name=op.f("uq_account_email")),
        sa.UniqueConstraint("username", name=op.f("uq_account_username")),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("account")
    # ### end Alembic commands ###
