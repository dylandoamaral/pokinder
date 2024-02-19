"""Add ranking information in fusion table

Revision ID: cbd742fb1fe8
Revises: 9d927bfa809b
Create Date: 2024-02-19 19:38:29.512088

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy import text

from alembic import op

connection = op.get_bind()

# revision identifiers, used by Alembic.
revision: str = "cbd742fb1fe8"
down_revision: Union[str, None] = "9d927bfa809b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("fusion", sa.Column("vote_score", sa.Integer(), server_default="0", nullable=False))
    op.add_column("fusion", sa.Column("vote_count", sa.Integer(), server_default="0", nullable=False))

    connection.execute(
        text(
            """
            UPDATE Fusion AS f
            SET vote_count = ranking.count,
                vote_score = ranking.score
            FROM (
                SELECT
                    s.fusion_id,
                    s.count,
                    s.score
                FROM (
                    SELECT
                        Vote.fusion_id,
                        COUNT(*) AS count,
                        ROUND(SUM(
                            CASE
                                WHEN Vote.vote_type = 'LIKED' THEN 1
                                WHEN Vote.vote_type = 'FAVORITE' THEN 2
                                ELSE 0
                            END
                        ) / COUNT(*) * 100) AS score
                    FROM Vote
                    GROUP BY Vote.fusion_id
                ) AS s
            ) AS ranking
            WHERE f.id = ranking.fusion_id;
            """
        )
    )


def downgrade() -> None:
    op.drop_column("fusion", "vote_count")
    op.drop_column("fusion", "vote_score")
