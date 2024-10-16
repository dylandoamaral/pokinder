"""Add account reset password

Revision ID: fa6d386bd446
Revises: 94256a9f3302
Create Date: 2024-10-16 16:12:55.941967

"""

from typing import Sequence, Union

import advanced_alchemy
import sqlalchemy as sa

from alembic import op

revision: str = "fa6d386bd446"
down_revision: Union[str, None] = "94256a9f3302"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "account_reset_password",
        sa.Column("account_id", advanced_alchemy.types.guid.GUID(length=16), nullable=False),
        sa.Column("token", sa.LargeBinary(), nullable=False),
        sa.Column(
            "status", sa.Enum("PENDING", "VALIDATED", "SKIPPED", name="accountresetpasswordstatus"), nullable=False
        ),
        sa.Column("created_at", advanced_alchemy.types.datetime.DateTimeUTC(timezone=True), nullable=False),
        sa.Column("id", advanced_alchemy.types.guid.GUID(length=16), nullable=False),
        sa.ForeignKeyConstraint(
            ["account_id"], ["account.id"], name=op.f("fk_account_reset_password_account_id_account")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_account_reset_password")),
    )


def downgrade() -> None:
    op.drop_table("account_reset_password")
