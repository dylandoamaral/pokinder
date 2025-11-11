"""Improve analytics performance

Revision ID: 09e8d2eb51ae
Revises: 69021d3bdd1f
Create Date: 2025-11-11 16:39:52.362726

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "09e8d2eb51ae"
down_revision: Union[str, None] = "69021d3bdd1f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("index_vote_account_id", "vote", ["account_id"], unique=False)
    op.create_index("index_vote_vote_type", "vote", ["vote_type"], unique=False)

    op.execute(
        """
        CREATE MATERIALIZED VIEW account_ranking AS
        SELECT 
            ranking.account_id as id,
            ranking.rank as rank
        FROM (
            SELECT
                vote.account_id AS account_id,
                rank() OVER (ORDER BY count(*) DESC) AS rank
            FROM vote
            GROUP BY vote.account_id
            ORDER BY RANK
        ) AS ranking
        """
    )
    op.execute(
        """
        SELECT cron.schedule(
            'refresh_account_ranking_hourly',
            '30 * * * *',
            $$REFRESH MATERIALIZED VIEW account_ranking;$$
        );
        """
    )
    op.create_index("index_account_ranking_rank", "account_ranking", ["rank"], unique=False)


def downgrade() -> None:
    op.drop_index("index_account_ranking_rank", table_name="account_ranking")
    op.execute("DELETE FROM cron.job WHERE jobname = 'refresh_account_ranking_hourly';")
    op.execute("DROP MATERIALIZED VIEW account_ranking;")

    op.drop_index("index_vote_vote_type", table_name="vote")
    op.drop_index("index_vote_account_id", table_name="vote")
