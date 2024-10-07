"""Add reference table

Revision ID: bb41c25611ec
Revises: cbd742fb1fe8
Create Date: 2024-10-07 17:49:40.070807

"""

from typing import Sequence, Union

import advanced_alchemy
from alembic import op
import sqlalchemy as sa

revision: str = "bb41c25611ec"
down_revision: Union[str, None] = "cbd742fb1fe8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "reference_family",
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "color",
            sa.Enum("BLUE", "RED", "GREEN", "ORANGE", "PURPLE", "YELLOW", "PINK", name="referencefamilycolor"),
            nullable=False,
        ),
        sa.Column("created_at", advanced_alchemy.types.datetime.DateTimeUTC(timezone=True), nullable=False),
        sa.Column("id", advanced_alchemy.types.guid.GUID(length=16), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_reference_family")),
        sa.UniqueConstraint("name", name="reference_family_name_should_be_unique"),
    )
    op.create_table(
        "reference",
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("source", sa.String(), nullable=True),
        sa.Column("family_id", advanced_alchemy.types.guid.GUID(length=16), nullable=False),
        sa.Column("created_at", advanced_alchemy.types.datetime.DateTimeUTC(timezone=True), nullable=False),
        sa.Column("id", advanced_alchemy.types.guid.GUID(length=16), nullable=False),
        sa.ForeignKeyConstraint(
            ["family_id"], ["reference_family.id"], name=op.f("fk_reference_family_id_reference_family")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_reference")),
        sa.UniqueConstraint("name", "family_id", name="reference_name_family_id_should_be_unique"),
    )
    op.create_table(
        "reference_proposal",
        sa.Column("reference_name", sa.String(length=255), nullable=False),
        sa.Column("reference_family_name", sa.String(length=255), nullable=False),
        sa.Column("status", sa.Enum("PENDING", "VALIDATED", "REFUSED", name="referenceproposalstatus"), nullable=False),
        sa.Column("fusion_id", advanced_alchemy.types.guid.GUID(length=16), nullable=False),
        sa.Column("proposer_id", advanced_alchemy.types.guid.GUID(length=16), nullable=False),
        sa.Column("judge_id", advanced_alchemy.types.guid.GUID(length=16), nullable=True),
        sa.Column("judged_at", advanced_alchemy.types.datetime.DateTimeUTC(timezone=True), nullable=True),
        sa.Column("reason", sa.String(length=1023), nullable=True),
        sa.Column("created_at", advanced_alchemy.types.datetime.DateTimeUTC(timezone=True), nullable=False),
        sa.Column("id", advanced_alchemy.types.guid.GUID(length=16), nullable=False),
        sa.ForeignKeyConstraint(["fusion_id"], ["fusion.id"], name=op.f("fk_reference_proposal_fusion_id_fusion")),
        sa.ForeignKeyConstraint(["judge_id"], ["account.id"], name=op.f("fk_reference_proposal_judge_id_account")),
        sa.ForeignKeyConstraint(
            ["proposer_id"], ["account.id"], name=op.f("fk_reference_proposal_proposer_id_account")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_reference_proposal")),
    )
    op.create_table(
        "fusion_reference",
        sa.Column("fusion_id", advanced_alchemy.types.guid.GUID(length=16), nullable=False),
        sa.Column("reference_id", advanced_alchemy.types.guid.GUID(length=16), nullable=False),
        sa.Column("reference_proposal_id", advanced_alchemy.types.guid.GUID(length=16), nullable=False),
        sa.ForeignKeyConstraint(["fusion_id"], ["fusion.id"], name=op.f("fk_fusion_reference_fusion_id_fusion")),
        sa.ForeignKeyConstraint(
            ["reference_id"], ["reference.id"], name=op.f("fk_fusion_reference_reference_id_reference")
        ),
        sa.ForeignKeyConstraint(
            ["reference_proposal_id"],
            ["reference_proposal.id"],
            name=op.f("fk_fusion_reference_reference_proposal_id_reference_proposal"),
        ),
    )


def downgrade() -> None:
    op.drop_table("fusion_reference")
    op.drop_table("reference_proposal")
    op.drop_table("reference")
    op.drop_table("reference_family")
    op.execute("DROP TYPE referencefamilycolor;")
    op.execute("DROP TYPE referenceproposalstatus;")
