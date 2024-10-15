from uuid import UUID

from bcrypt import checkpw, gensalt, hashpw
from litestar import Controller, post
from litestar.exceptions import NotAuthorizedException, NotFoundException

from src.component.account.account_dependency import AccountDependency
from src.component.account.account_table import AccountRole
from src.security.jwt import (
    DEFAULT_REFRESH_TIME_DELTA,
    EncodedTokens,
    Subject,
    TokenType,
    decode_jwt_token,
    encode_jwt_token,
)
from src.utils.exceptions import ConflictException

from .account_dto import DTO, returnDTO
from .account_model import AccountLogin, AccountSignup


class AccountController(Controller):
    dto = DTO
    return_dto = returnDTO
    path = "/account"
    include_in_schema = False

    @post(path="/signup", dto=None)
    async def signup(self, account_dependency: AccountDependency, data: AccountSignup) -> UUID:
        is_username_exists = await account_dependency.check_username_exists(data.username)

        if is_username_exists:
            raise ConflictException(detail="USERNAME_EXISTS")

        is_email_exists = await account_dependency.check_email_exists(data.email)

        if is_email_exists:
            raise ConflictException(detail="EMAIL_EXISTS")

        is_account_id_exists = await account_dependency.check_account_id_exists(data.account_id)

        if is_account_id_exists:
            raise ConflictException(detail="ACCOUNT_ID_EXISTS")

        hashed_password = hashpw(data.password.encode("utf-8"), gensalt())
        await account_dependency.signup(data, hashed_password)

        return self.generateTokens(Subject(account_id=data.account_id, username=data.username, role=AccountRole.USER))

    @post(path="/login", dto=None)
    async def login(self, account_dependency: AccountDependency, data: AccountLogin) -> UUID:
        account = await account_dependency.retrieve_unsecured_account(data)

        if not account:
            raise NotFoundException()

        if not checkpw(data.password.encode("utf-8"), account.password):
            # We don't want the "hacker" to know if the name exists or not.
            raise NotFoundException()

        return self.generateTokens(Subject(account_id=account.id, username=account.username, role=account.role))

    @post(path="/refresh", dto=None)
    async def refresh(self, refresh_token: str) -> UUID:
        token = decode_jwt_token(refresh_token)

        if token.typ is not TokenType.REFRESH:
            raise ConflictException(detail="WRONG_TOKEN_TYPE")

        return self.generateTokens(token.sub)

    def generateTokens(self, subject: Subject) -> EncodedTokens:
        return EncodedTokens(
            token=encode_jwt_token(subject, TokenType.ACCESS),
            refresh=encode_jwt_token(subject, TokenType.REFRESH, expiration=DEFAULT_REFRESH_TIME_DELTA),
        )
