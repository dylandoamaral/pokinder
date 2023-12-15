from typing import Optional, Protocol, runtime_checkable
from uuid import UUID

from src.component.account.account_table import Account

from .account_model import AccountLogin, AccountSignup


@runtime_checkable
class AccountDependency(Protocol):
    async def signup(self, account_signup: AccountSignup, hashed_password: int) -> UUID:
        pass

    async def retrieve_unsecured_account(self, account_login: AccountLogin) -> Optional[Account]:
        pass

    async def check_username_exists(self, username: str) -> bool:
        pass

    async def check_account_id_exists(self, account_id: UUID) -> bool:
        pass
