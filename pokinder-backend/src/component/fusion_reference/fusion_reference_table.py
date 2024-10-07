from sqlalchemy import Column, ForeignKey, Table

from src.utils.sqlalchemy import BaseTable

FusionReference = Table(
    "fusion_reference",
    BaseTable.metadata,
    Column("fusion_id", ForeignKey("fusion.id"), nullable=False),
    Column("reference_id", ForeignKey("reference.id"), nullable=False),
    Column("reference_proposal_id", ForeignKey("reference_proposal.id"), nullable=False),
)
