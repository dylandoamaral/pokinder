from datetime import datetime, timedelta
from uuid import UUID

from jose import JWTError, jwt
from litestar.exceptions import NotAuthorizedException
from pydantic import UUID4, BaseModel

from src.utils.env import retrieve_jwt_secret

DEFAULT_TIME_DELTA = timedelta(days=1)
ALGORITHM = "HS256"
JWT_SECRET = retrieve_jwt_secret()


class Token(BaseModel):
    exp: datetime
    iat: datetime
    sub: str


def decode_jwt_token(encoded_token: str) -> Token:
    """
    Helper function that decodes a jwt token and returns the value stored under the ``sub`` key

    If the token is invalid or expired (i.e. the value stored under the exp key is in the past) an exception is raised
    """
    try:
        payload = jwt.decode(token=encoded_token, key=JWT_SECRET, algorithms=[ALGORITHM])
        return Token(**payload)
    except JWTError as e:
        raise NotAuthorizedException("Invalid token") from e


def encode_jwt_token(user_id: UUID, expiration: timedelta = DEFAULT_TIME_DELTA) -> str:
    """Helper function that encodes a JWT token with expiration and a given user_id"""
    token = Token(
        exp=datetime.now() + expiration,
        iat=datetime.now(),
        sub=str(user_id),
    )
    return jwt.encode(token.model_dump(), JWT_SECRET, algorithm=ALGORITHM)
