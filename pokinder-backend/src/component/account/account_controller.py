import hashlib
import random
import string
from datetime import datetime, timedelta, timezone
from uuid import UUID

from bcrypt import checkpw, gensalt, hashpw
from litestar import Controller, post
from litestar.exceptions import NotAuthorizedException, NotFoundException

from src.component.account.account_dependency import AccountDependency
from src.component.account.account_reset_password_table import (
    AccountResetPasswordStatus,
)
from src.component.account.account_table import AccountRole
from src.security.jwt import (
    DEFAULT_REFRESH_TIME_DELTA,
    EncodedTokens,
    Subject,
    TokenType,
    decode_jwt_token,
    encode_jwt_token,
)
from src.shared.dependency.email_dependency import EmailDependency
from src.utils.env import retrieve_frontend_endpoint
from src.utils.exceptions import ConflictException

from .account_dto import DTO, returnDTO
from .account_model import (
    AccountChangePassword,
    AccountLogin,
    AccountResetPassword,
    AccountSignup,
)


class AccountController(Controller):
    dto = DTO
    return_dto = returnDTO
    path = "/account"
    include_in_schema = False

    @post(path="/signup", dto=None)
    async def signup(self, account_dependency: AccountDependency, data: AccountSignup) -> EncodedTokens:
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
    async def login(self, account_dependency: AccountDependency, data: AccountLogin) -> EncodedTokens:
        account = await account_dependency.retrieve_unsecured_account(data)

        if not account:
            raise NotFoundException()

        if not checkpw(data.password.encode("utf-8"), account.password):
            # We don't want the "hacker" to know if the name exists or not.
            raise NotFoundException()

        return self.generateTokens(Subject(account_id=account.id, username=account.username, role=account.role))

    @post(path="/refresh", dto=None)
    async def refresh(self, refresh_token: str) -> EncodedTokens:
        token = decode_jwt_token(refresh_token)

        if token.typ is not TokenType.REFRESH:
            raise ConflictException(detail="WRONG_TOKEN_TYPE")

        return self.generateTokens(token.sub)

    def generateTokens(self, subject: Subject) -> EncodedTokens:
        return EncodedTokens(
            token=encode_jwt_token(subject, TokenType.ACCESS),
            refresh=encode_jwt_token(subject, TokenType.REFRESH, expiration=DEFAULT_REFRESH_TIME_DELTA),
        )

    @post(path="/reset_password", dto=None)
    async def reset_password(
        self,
        account_dependency: AccountDependency,
        email_dependency: EmailDependency,
        data: AccountResetPassword,
    ) -> None:
        maybe_account = await account_dependency.retrieve_account_by_email(data.email)

        if maybe_account is None:
            # NOTE: don't raise exception because we don't want hacker to know if email exists.
            return

        account_id = maybe_account.id
        username = maybe_account.username

        token = "".join(random.choices(string.ascii_letters + string.digits, k=32))
        hashed_token = hashlib.sha256(token.encode("utf-8")).digest()

        await account_dependency.insert_account_reset_password(
            account_id=account_id,
            token=hashed_token,
        )

        reset_link = f"{retrieve_frontend_endpoint()}/newpassword?token={token}"

        email_dependency.send_email(
            subject="Your Pokinder reset link is ready",
            to=data.email,
            body=f"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="text-align: center; padding: 20px 0;">
                            <h2 style="color: #e13d48;">Password Reset Request</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; background-color: #f9f9f9;">
                            <p>Hi <strong>{username}</strong>,</p>
                            <p>We received a request to reset your password. Please click the button below to reset your password:</p>
                            <p style="text-align: left; padding-top: 20px; padding-bottom: 20px;">
                                <a href="{reset_link}" style="background-color: #e13d48; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Your Password</a>
                            </p>
                            <p>If you didn’t request a password reset, please ignore this email or contact our support team.</p>
                            <p>Thanks,</p>
                            <p>The Pokinder Support Team</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; text-align: center; background-color: #f1f1f1; font-size: 12px;">
                            <p>&copy; 2023-{datetime.now().year} Pokinder. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """,
        )

    @post(path="/change_password", dto=None)
    async def change_password(
        self,
        account_dependency: AccountDependency,
        data: AccountChangePassword,
    ) -> None:
        hashed_token = hashlib.sha256(data.token.encode("utf-8")).digest()

        maybe_account_reset_password = await account_dependency.retrieve_account_reset_password(hashed_token)

        if (
            maybe_account_reset_password is None
            or maybe_account_reset_password.status != AccountResetPasswordStatus.PENDING
            or datetime.now(timezone.utc) - maybe_account_reset_password.created_at > timedelta(hours=1)
        ):
            raise NotFoundException()

        id = maybe_account_reset_password.id
        account_id = maybe_account_reset_password.account_id
        hashed_password = hashpw(data.password.encode("utf-8"), gensalt())

        await account_dependency.validate_account_reset_password(id)
        await account_dependency.update_password(account_id, hashed_password)
