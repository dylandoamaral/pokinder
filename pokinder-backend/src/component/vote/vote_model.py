from uuid import UUID

from pydantic import BaseModel

from src.component.vote.vote_table import VoteType


class VoteAdd(BaseModel):
    fusion_id: UUID
    vote_type: VoteType
