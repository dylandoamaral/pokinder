from typing import Protocol, runtime_checkable
from uuid import UUID

from .analytics_model import Analytics


@runtime_checkable
class AnalyticsDependency(Protocol):
    async def get(self, account_id: UUID) -> list[Analytics]:
        pass
