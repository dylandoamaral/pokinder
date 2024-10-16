from uuid import UUID

from pydantic import BaseModel


class AccountSignup(BaseModel):
    username: str
    email: str
    password: str
    account_id: UUID


class AccountLogin(BaseModel):
    username_or_email: str
    password: str


class AccountResetPassword(BaseModel):
    email: str


class AccountChangePassword(BaseModel):
    token: str
    password: str
