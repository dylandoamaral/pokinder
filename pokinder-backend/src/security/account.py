import json
from uuid import UUID

from litestar.stores.base import Store
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from src.component.account.account_table import Account, AccountRole

ACCOUNT_CACHE_TTL_SECONDS = 60


def _key(account_id: UUID) -> str:
    return f"auth:account:{account_id}"


def _build_account(account_id: UUID, username: str, role: AccountRole) -> Account:
    # NOTE: transient object, only id, username and role are populated.
    return Account(id=account_id, username=username, email="", role=role, password=b"")


async def _fetch_row(engine: AsyncEngine, account_id: UUID):
    async with AsyncSession(engine) as session:
        result = await session.execute(select(Account.username, Account.role).where(Account.id == account_id))
        return result.one_or_none()


async def load_account(engine: AsyncEngine, store: Store, account_id: UUID) -> Account | None:
    key = _key(account_id)

    cached = await store.get(key)

    if cached is not None:
        data = json.loads(cached)
        return _build_account(account_id, data["username"], AccountRole[data["role"]])

    row = await _fetch_row(engine, account_id)

    if row is None:
        return None

    await store.set(
        key,
        json.dumps({"username": row.username, "role": row.role.name}).encode("utf-8"),
        expires_in=ACCOUNT_CACHE_TTL_SECONDS,
    )

    return _build_account(account_id, row.username, row.role)


async def invalidate_account(store: Store, account_id: UUID) -> None:
    await store.delete(_key(account_id))
