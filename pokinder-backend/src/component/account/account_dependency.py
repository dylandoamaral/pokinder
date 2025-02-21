from typing import Optional, Protocol, runtime_checkable
from uuid import UUID

from src.component.account.account_table import Account

from .account_model import AccountLogin, AccountResetPassword, AccountSignup


@runtime_checkable
class AccountDependency(Protocol):
    async def signup(self, account_signup: AccountSignup, hashed_password: int) -> UUID:
        pass

    async def retrieve_unsecured_account(self, account_login: AccountLogin) -> Optional[Account]:
        pass

    async def retrieve_account_by_email(self, email: str, account_id: Optional[UUID]) -> Optional[Account]:
        pass

    async def check_username_exists(self, username: str) -> bool:
        pass

    async def check_email_exists(self, email: str) -> bool:
        pass

    async def check_account_id_exists(self, account_id: UUID) -> bool:
        pass

    async def insert_account_reset_password(self, account_id: str, token: bytes) -> None:
        pass

    async def retrieve_account_reset_password(self, token: bytes) -> Optional[AccountResetPassword]:
        pass

    async def validate_account_reset_password(self, id: UUID) -> None:
        pass

    async def update_password(self, account_id: str, hashed_password: bytes) -> None:
        pass
