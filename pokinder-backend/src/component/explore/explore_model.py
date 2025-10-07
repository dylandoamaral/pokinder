from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

from src.component.vote import VoteType


@dataclass
class ExploreHistory:
    fusion_id: UUID
    fusion_path: str
    fusion_is_removed: bool
    fusion_head_name: str
    fusion_head_name_separator_index: str
    fusion_body_name: str
    fusion_body_name_separator_index: str
    vote_type: VoteType
    vote_created_at: datetime


@dataclass
class ExploreRanking:
    fusion_id: UUID
    fusion_path: str
    fusion_is_removed: bool
    fusion_head_name: str
    fusion_head_name_separator_index: str
    fusion_body_name: str
    fusion_body_name_separator_index: str
    fusion_rank: int
    fusion_score: int
    fusion_vote_count: int


@dataclass
class ExplorePokedexFusion:
    fusion_path: str
    fusion_is_removed: bool
    fusion_head_name: str
    fusion_head_name_separator_index: str
    fusion_head_type_1: str
    fusion_head_type_2: str
    fusion_head_weight: float
    fusion_head_height: float
    fusion_body_name: str
    fusion_body_name_separator_index: str
    fusion_body_type_1: str
    fusion_body_type_2: str
    fusion_body_weight: float
    fusion_body_height: float


@dataclass
class ExplorePokedex:
    fusion_id: UUID
    fusion_information: Optional[ExplorePokedexFusion]
    has_voted: bool


@dataclass
class ExploreReferenceCount:
    reference_family_name: str
    count: int


@dataclass
class ExploreReference:
    fusion_id: UUID
    fusion_path: str
    fusion_is_removed: bool
    fusion_head_name: str
    fusion_head_name_separator_index: str
    fusion_body_name: str
    fusion_body_name_separator_index: str
    reference_name: str
    reference_link: str
    reference_proposer_name: str
