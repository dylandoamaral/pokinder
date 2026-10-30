"""Refresh materialized views concurrently

Revision ID: c7a91e4d5f08
Revises: b44f2d6a3b27
Create Date: 2025-11-14 10:00:00.000000

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c7a91e4d5f08"
down_revision: Union[str, None] = "b44f2d6a3b27"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _reschedule(jobname: str, schedule: str, view: str, concurrently: bool) -> None:
    options = "CONCURRENTLY " if concurrently else ""
    op.execute(f"DELETE FROM cron.job WHERE jobname = '{jobname}';")
    op.execute(f"""
        SELECT cron.schedule(
            '{jobname}',
            '{schedule}',
            $$REFRESH MATERIALIZED VIEW {options}{view};$$
        );
        """)


def upgrade() -> None:
    # NOTE: REFRESH ... CONCURRENTLY requires a unique index covering all rows.
    op.create_index("index_fusion_denormalized_id", "fusion_denormalized", ["id"], unique=True)
    op.create_index("index_account_ranking_id", "account_ranking", ["id"], unique=True)

    _reschedule("refresh_fusion_denormalized_hourly", "0 * * * *", "fusion_denormalized", concurrently=True)
    _reschedule("refresh_account_ranking_hourly", "30 * * * *", "account_ranking", concurrently=True)


def downgrade() -> None:
    _reschedule("refresh_account_ranking_hourly", "30 * * * *", "account_ranking", concurrently=False)
    _reschedule("refresh_fusion_denormalized_hourly", "0 * * * *", "fusion_denormalized", concurrently=False)

    op.drop_index("index_account_ranking_id", table_name="account_ranking")
    op.drop_index("index_fusion_denormalized_id", table_name="fusion_denormalized")
