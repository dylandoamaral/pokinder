from typing import Protocol, runtime_checkable


@runtime_checkable
class StatisticsDependency(Protocol):
    async def get_total_vote(self) -> int:
        pass

    async def add_total_vote(self) -> int:
        pass

    async def get_total_reference(self) -> int:
        pass

    async def add_total_reference(self) -> int:
        pass

    async def get_total_account(self) -> int:
        pass

    async def add_total_account(self) -> int:
        pass
