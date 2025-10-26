from dataclasses import dataclass
from typing import Optional
from uuid import UUID


@dataclass
class FusionDraw:
    id: UUID
    path: str
    is_removed: bool
    head_name: str
    head_name_separator_index: str
    head_type_1: str
    head_type_2: Optional[str]
    head_pokedex_id: int
    body_name: str
    body_name_separator_index: str
    body_type_1: str
    body_type_2: Optional[str]
    body_pokedex_id: int
    creators: list
    references: list
