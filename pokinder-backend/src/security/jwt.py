from datetime import datetime, timedelta
from enum import Enum
from uuid import UUID

from joserfc import jwt
from joserfc.errors import InvalidPayloadError
from litestar.exceptions import NotAuthorizedException
from pydantic import BaseModel, field_serializer, field_validator

from src.component.account.account_table import AccountRole
from src.utils.env import retrieve_jwt_secret

DEFAULT_TIME_DELTA = timedelta(days=1)
DEFAULT_REFRESH_TIME_DELTA = timedelta(days=7)

ALGORITHM = "HS256"
JWT_SECRET = retrieve_jwt_secret()


class Subject(BaseModel):
    account_id: UUID
    username: str
    role: AccountRole

    @field_serializer("role")
    def serialize_role(self, role: AccountRole):
        return role.name

    @field_validator("role", mode="before")
    @classmethod
    def deserialize_role(cls, v) -> AccountRole:
        if isinstance(v, AccountRole):
            return v
        return AccountRole[v]


class TokenType(Enum):
    ACCESS = 0
    REFRESH = 1


class Token(BaseModel):
    exp: datetime
    iat: datetime
    sub: Subject
    typ: TokenType


class EncodedTokens(BaseModel):
    token: str
    refresh: str


def decode_jwt_token(encoded_token: str) -> Token:
    """
    Helper function that decodes a jwt token and returns the value stored under the ``sub`` key

    If the token is invalid or expired (i.e. the value stored under the exp key is in the past) an exception is raised
    """
    try:
        payload = jwt.decode(encoded_token, JWT_SECRET).claims
        if payload["sub"].get("role") is None:
            payload["sub"]["role"] = AccountRole.USER.stringify()
        token = Token(**payload)

        if token.exp < datetime.now():
            raise NotAuthorizedException(detail="EXPIRED_TOKEN")

        return Token(**payload)
    except InvalidPayloadError as e:
        raise NotAuthorizedException(detail="INVALID_TOKEN") from e


def encode_jwt_token(subject: Subject, typ: TokenType, expiration: timedelta = DEFAULT_TIME_DELTA) -> str:
    """Helper function that encodes a JWT token with expiration and a given user_id"""
    header = {"alg": ALGORITHM}
    token = Token(exp=datetime.now() + expiration, iat=datetime.now(), sub=subject, typ=typ)
    payload = token.model_dump(mode="json")
    return jwt.encode(header, payload, JWT_SECRET)
