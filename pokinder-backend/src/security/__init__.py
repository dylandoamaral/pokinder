import litestar
from litestar.datastructures import State

from src.security.jwt import Token

Request = litestar.Request[str, Token, State]
