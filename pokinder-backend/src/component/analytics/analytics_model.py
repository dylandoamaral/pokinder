from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class PokemonAnalytics(BaseModel):
    name: str
    filename: int
    average_score: int


class CreatorAnalytics(BaseModel):
    name: str
    filename: UUID
    average_score: int


class CommunityAnalytics(BaseModel):
    account_count: int
    fusion_count: int
    creator_count: int
    vote_count: int
    dislike_count: int
    favorite_count: int
    like_count: int
    favorite_pokemon_head: PokemonAnalytics
    favorite_pokemon_body: PokemonAnalytics
    favorite_creator: CreatorAnalytics


class UserAnalytics(BaseModel):
    rank: int
    created_at: Optional[datetime]
    vote_count: int
    dislike_count: int
    favorite_count: int
    like_count: int
    favorite_pokemon_head: Optional[PokemonAnalytics]
    favorite_pokemon_body: Optional[PokemonAnalytics]
    favorite_creator: Optional[CreatorAnalytics]


class Analytics(BaseModel):
    community: CommunityAnalytics
    user: UserAnalytics
