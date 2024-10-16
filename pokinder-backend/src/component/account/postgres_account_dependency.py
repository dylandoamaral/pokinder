from typing import Optional
from uuid import UUID

from sqlalchemy import exists, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .account_dependency import AccountDependency
from .account_model import AccountLogin, AccountSignup
from .account_reset_password_table import (
    AccountResetPassword,
    AccountResetPasswordStatus,
)
from .account_table import Account


class PostgresAccountDependency(AccountDependency):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def signup(self, account_signup: AccountSignup, hashed_password: int) -> UUID:
        account = Account(
            id=account_signup.account_id,
            username=account_signup.username,
            email=account_signup.email,
            password=hashed_password,
        )
        self.session.add(account)
        return await self.session.commit()

    async def retrieve_unsecured_account(self, account_login: AccountLogin) -> Optional[Account]:
        query = select(Account).filter(
            or_(
                Account.username == account_login.username_or_email,
                Account.email == account_login.username_or_email,
            )
        )

        result = await self.session.scalars(query)
        maybe_instance = result.one_or_none()

        return maybe_instance

    async def retrieve_account_by_email(self, email: str) -> Optional[Account]:
        query = select(Account).where(Account.email == email)
        return await self.session.scalar(query)

    async def check_username_exists(self, username: str) -> bool:
        query = select(exists().where(Account.username == username))
        return await self.session.scalar(query)

    async def check_email_exists(self, email: str) -> bool:
        query = select(exists().where(Account.email == email))
        return await self.session.scalar(query)

    async def check_account_id_exists(self, account_id: UUID) -> bool:
        query = select(exists().where(Account.id == account_id))
        return await self.session.scalar(query)

    async def insert_account_reset_password(self, account_id: str, token: bytes) -> None:
        await self.session.execute(
            update(AccountResetPassword)
            .where(AccountResetPassword.account_id == account_id)
            .values(status=AccountResetPasswordStatus.SKIPPED)
        )

        account_reset_password = AccountResetPassword(account_id=account_id, token=token)
        self.session.add(account_reset_password)
        return await self.session.commit()

    async def retrieve_account_reset_password(self, token: bytes) -> Optional[AccountResetPassword]:
        query = select(AccountResetPassword).where(AccountResetPassword.token == token)
        return await self.session.scalar(query)

    async def validate_account_reset_password(self, id: UUID) -> None:
        await self.session.execute(
            update(AccountResetPassword)
            .where(AccountResetPassword.id == id)
            .values(status=AccountResetPasswordStatus.VALIDATED)
        )
        await self.session.commit()

    async def update_password(self, account_id: str, hashed_password: bytes) -> None:
        await self.session.execute(update(Account).where(Account.id == account_id).values(password=hashed_password))
        await self.session.commit()


def use_postgres_account_dependency(db_session: AsyncSession) -> AccountDependency:
    return PostgresAccountDependency(db_session)
