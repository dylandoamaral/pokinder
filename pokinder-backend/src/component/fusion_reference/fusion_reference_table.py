from sqlalchemy import Column, ForeignKey, Table, UniqueConstraint

from src.utils.sqlalchemy import BaseTable

FusionReference = Table(
    "fusion_reference",
    BaseTable.metadata,
    Column("fusion_id", ForeignKey("fusion.id"), nullable=False),
    Column("reference_id", ForeignKey("reference.id"), nullable=False),
    Column("reference_proposal_id", ForeignKey("reference_proposal.id"), nullable=False),
    UniqueConstraint("fusion_id", "reference_id", name="fusion_id_reference_id_should_be_unique"),
)
