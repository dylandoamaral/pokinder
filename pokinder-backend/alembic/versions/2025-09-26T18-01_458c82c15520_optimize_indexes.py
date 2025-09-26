"""Optimize indexes

Revision ID: 458c82c15520
Revises: a4ce5b113c45
Create Date: 2025-09-26 18:01:29.903659

"""

from typing import Sequence, Union

from alembic import op

revision: str = "458c82c15520"
down_revision: Union[str, None] = "a4ce5b113c45"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("index_account_id", "account", ["id"], unique=False)
    op.create_index("index_fusion_body_id", "fusion", ["body_id"], unique=False)
    op.create_index("index_fusion_head_id", "fusion", ["head_id"], unique=False)
    op.create_index("index_fusion_path", "fusion", ["path"], unique=False)
    op.create_index("index_fusion_vote_count", "fusion", ["vote_count"], unique=False)
    op.create_index("index_reference_name", "reference", ["name"], unique=False)
    op.create_index("index_reference_family_name", "reference_family", ["name"], unique=False)
    op.create_index("index_vote_account_id_fusion_id", "vote", ["account_id", "fusion_id"], unique=False)


def downgrade() -> None:
    op.drop_index("index_vote_account_id_fusion_id", table_name="vote")
    op.drop_index("index_reference_family_name", table_name="reference_family")
    op.drop_index("index_reference_name", table_name="reference")
    op.drop_index("index_fusion_vote_count", table_name="fusion")
    op.drop_index("index_fusion_path", table_name="fusion")
    op.drop_index("index_fusion_head_id", table_name="fusion")
    op.drop_index("index_fusion_body_id", table_name="fusion")
    op.drop_index("index_account_id", table_name="account")
