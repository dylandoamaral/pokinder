from sqlalchemy import Column, ForeignKey, Table

from src.utils.sqlalchemy import BaseTable

FusionCreator = Table(
    "fusion_creator",
    BaseTable.metadata,
    Column("fusion_id", ForeignKey("fusion.id"), nullable=False),
    Column("creator_id", ForeignKey("creator.id"), nullable=False),
)
