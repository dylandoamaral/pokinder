from ctypes import cast

from litestar.connection import ASGIConnection
from litestar.exceptions import NotAuthorizedException
from litestar.middleware import AbstractAuthenticationMiddleware, AuthenticationResult
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.component.account import Account
from src.security.jwt import decode_jwt_token

API_KEY_HEADER = "X-API-KEY"


class JWTAuthenticationMiddleware(AbstractAuthenticationMiddleware):
    async def authenticate_request(self, connection: ASGIConnection) -> AuthenticationResult:
        """
        Given a request, parse the request api key stored in the header and retrieve the user correlating to the token from the DB
        """

        # retrieve the auth header
        jwt_token = connection.headers.get(API_KEY_HEADER)

        if not jwt_token:
            raise NotAuthorizedException()

        token = decode_jwt_token(encoded_token=jwt_token)

        engine = connection.app.state.db_engine

        async with AsyncSession(engine) as async_session:
            async with async_session.begin():
                user = await async_session.execute(select(Account).where(Account.id == token.sub))

        if not user:
            raise NotAuthorizedException()

        return AuthenticationResult(user=user, auth=token)
