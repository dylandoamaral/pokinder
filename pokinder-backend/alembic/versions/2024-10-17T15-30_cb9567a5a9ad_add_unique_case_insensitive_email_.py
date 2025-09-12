"""Add unique case insensitive email constraint

Revision ID: cb9567a5a9ad
Revises: fa6d386bd446
Create Date: 2024-10-17 15:30:51.507323

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "cb9567a5a9ad"
down_revision: Union[str, None] = "fa6d386bd446"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("index_account_email_case_insensitive", "account", [sa.text("lower(email)")], unique=True)


def downgrade() -> None:
    op.drop_index("index_account_email_case_insensitive", table_name="account")
