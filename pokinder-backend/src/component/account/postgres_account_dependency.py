from typing import Optional
from uuid import UUID

from sqlalchemy import exists, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from .account_dependency import AccountDependency
from .account_model import AccountLogin, AccountSignup
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

    async def check_username_exists(self, username: str) -> bool:
        query = select(exists().where(Account.username == username))
        return await self.session.scalar(query)

    async def check_email_exists(self, email: str) -> bool:
        query = select(exists().where(Account.email == email))
        return await self.session.scalar(query)

    async def check_account_id_exists(self, account_id: UUID) -> bool:
        query = select(exists().where(Account.id == account_id))
        return await self.session.scalar(query)


def use_postgres_account_dependency(db_session: AsyncSession) -> AccountDependency:
    return PostgresAccountDependency(db_session)
