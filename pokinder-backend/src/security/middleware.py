from ctypes import cast
from uuid import UUID

from litestar.connection import ASGIConnection
from litestar.exceptions import NotAuthorizedException
from litestar.middleware import AbstractAuthenticationMiddleware, AuthenticationResult
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.account import Account
from src.component.account.account_table import AccountRole
from src.security.jwt import decode_jwt_token
from src.utils.uuid import is_uuid

API_KEY_HEADER = "X-API-KEY"


class JWTAuthenticationMiddleware(AbstractAuthenticationMiddleware):
    async def authenticate_request(self, connection: ASGIConnection) -> AuthenticationResult:
        """
        Given a request, parse the request api key stored in the header and retrieve the user correlating to the token from the DB
        """

        if connection.scope.get("method") == "OPTIONS":
            return AuthenticationResult(None, None)

        # retrieve the auth header
        headers = {key.upper(): value for key, value in connection.headers.items()}
        token = headers.get(API_KEY_HEADER)

        if not token:
            raise NotAuthorizedException()

        if is_uuid(token):
            return await self.authenticate_as_guest(connection, UUID(token))
        else:
            return await self.authenticate_as_user(connection, token)

    # Handle authentication for user logged.
    async def authenticate_as_user(self, connection: ASGIConnection, jwt_token: str) -> AuthenticationResult:
        token = decode_jwt_token(encoded_token=jwt_token)

        engine = connection.app.state.db_engine

        async with AsyncSession(engine) as async_session:
            async with async_session.begin():
                result = await async_session.execute(select(Account).where(Account.id == token.sub.account_id))
                account = result.scalar_one_or_none()

                async_session.expunge(account)

            if not account:
                raise NotAuthorizedException()

            return AuthenticationResult(user=account, auth=token)

    # Handle authentication for guest having a random account_id but not logged.
    async def authenticate_as_guest(self, connection: ASGIConnection, account_id: UUID) -> AuthenticationResult:
        engine = connection.app.state.db_engine

        async with AsyncSession(engine) as async_session:
            async with async_session.begin():
                result = await async_session.execute(select(Account).where(Account.id == account_id))
                account = result.scalar_one_or_none()

            if account is not None:
                raise NotAuthorizedException()

            account = Account(id=account_id, username="Guest", email="", role=AccountRole.USER, password=b"")

            return AuthenticationResult(user=account, auth=account_id)
