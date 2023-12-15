from datetime import datetime, timedelta
from uuid import UUID

from joserfc import jwt
from joserfc.errors import InvalidPayloadError
from litestar.exceptions import NotAuthorizedException
from pydantic import BaseModel, validator

from src.utils.env import retrieve_jwt_secret

DEFAULT_TIME_DELTA = timedelta(days=1)
ALGORITHM = "HS256"
JWT_SECRET = retrieve_jwt_secret()


class Subject(BaseModel):
    account_id: UUID
    username: str


class Token(BaseModel):
    exp: datetime
    iat: datetime
    sub: Subject


def decode_jwt_token(encoded_token: str) -> Token:
    """
    Helper function that decodes a jwt token and returns the value stored under the ``sub`` key

    If the token is invalid or expired (i.e. the value stored under the exp key is in the past) an exception is raised
    """
    try:
        payload = jwt.decode(encoded_token, JWT_SECRET).claims
        return Token(**payload)
    except InvalidPayloadError as e:
        raise NotAuthorizedException("Invalid token") from e


def encode_jwt_token(subject: Subject, expiration: timedelta = DEFAULT_TIME_DELTA) -> str:
    """Helper function that encodes a JWT token with expiration and a given user_id"""
    header = {"alg": ALGORITHM}
    token = Token(
        exp=datetime.now() + expiration,
        iat=datetime.now(),
        sub=subject,
    )
    payload = token.model_dump(mode="json")
    return jwt.encode(header, payload, JWT_SECRET)
