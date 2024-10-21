from litestar import Request
from litestar.stores.base import Store
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.account.account_table import Account
from src.component.fusion_reference import FusionReference
from src.component.vote.vote_table import Vote

from .statistics_dependency import StatisticsDependency

TOTAL_VOTE_KEY = "total_vote"
TOTAL_REFERENCE_KEY = "total_reference"
TOTAL_ACCOUNT_KEY = "total_account"


class StatisticsDependencyPostgresRedis(StatisticsDependency):
    def __init__(self, session: AsyncSession, store: Store):
        self.session = session
        self.store = store

    async def __count(self, table) -> int:
        query = select(func.count()).select_from(table)
        result = await self.session.execute(query)
        count = result.scalar()
        return count

    def __int_to_bytes(self, number: int) -> bytes:
        return number.to_bytes(4, byteorder="big")

    def __bytes_to_int(self, number: bytes) -> int:
        return int.from_bytes(number, byteorder="big")

    async def __get_or_set(self, table, key) -> int:
        maybe_raw = await self.store.get(key)

        if maybe_raw:
            return self.__bytes_to_int(maybe_raw)
        else:
            value = await self.__count(table)
            await self.store.set(key, self.__int_to_bytes(value))
            return value

    async def __add_one(self, table, key) -> int:
        value = await self.__get_or_set(table, key)
        await self.store.set(key, self.__int_to_bytes(value + 1))
        return value + 1

    async def get_total_vote(self) -> int:
        return await self.__get_or_set(Vote, TOTAL_VOTE_KEY)

    async def add_total_vote(self) -> int:
        return await self.__add_one(Vote, TOTAL_VOTE_KEY)

    async def get_total_reference(self) -> int:
        return await self.__get_or_set(FusionReference, TOTAL_REFERENCE_KEY)

    async def add_total_reference(self) -> int:
        return await self.__add_one(FusionReference, TOTAL_REFERENCE_KEY)

    async def get_total_account(self) -> int:
        return await self.__get_or_set(Account, TOTAL_ACCOUNT_KEY)

    async def add_total_account(self) -> int:
        return await self.__add_one(Account, TOTAL_ACCOUNT_KEY)


def use_statistics_dependency_postgres_redis(db_session: AsyncSession, request: Request) -> StatisticsDependency:
    return StatisticsDependencyPostgresRedis(db_session, request.app.stores.get("statistics"))
