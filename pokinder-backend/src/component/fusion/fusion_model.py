from dataclasses import dataclass

from .fusion_table import Fusion


@dataclass
class Ranking:
    fusion: dict
    rank: int
