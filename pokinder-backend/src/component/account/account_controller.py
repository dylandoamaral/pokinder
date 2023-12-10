from uuid import UUID

from bcrypt import checkpw, gensalt, hashpw
from litestar import Controller, post
from litestar.exceptions import NotAuthorizedException, NotFoundException

from src.component.account.account_dependency import AccountDependency
from src.security.jwt import encode_jwt_token
from src.utils.exceptions import ConflictException

from .account_model import AccountLogin, AccountSignup
from .account_table import ReadDTO, WriteDTO


class AccountController(Controller):
    dto = WriteDTO
    return_dto = ReadDTO
    path = "/account"

    @post(path="/signup", dto=None)
    async def signup(self, account_dependency: AccountDependency, data: AccountSignup) -> UUID:
        is_username_exists = await account_dependency.check_username_exists(data.username)

        if is_username_exists:
            raise ConflictException(detail="USERNAME_EXISTS")

        is_account_id_exists = await account_dependency.check_account_id_exists(data.account_id)

        if is_account_id_exists:
            raise ConflictException(detail="ACCOUNT_ID_EXISTS")

        hashed_password = hashpw(data.password.encode("utf-8"), gensalt())
        await account_dependency.signup(data, hashed_password)

        return encode_jwt_token(data.account_id)

    @post(path="/login", dto=None)
    async def login(self, account_dependency: AccountDependency, data: AccountLogin) -> UUID:
        account = await account_dependency.retrieve_unsecured_account(data)

        if not account:
            raise NotFoundException()

        if not checkpw(data.password.encode("utf-8"), account.password):
            # We don't want the "hacker" to know if the name exists or not.
            raise NotFoundException()

        return encode_jwt_token(account.id)
