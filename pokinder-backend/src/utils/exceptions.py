from typing import TYPE_CHECKING

from litestar.contrib.repository.exceptions import (
    ConflictError as RepositoryConflictException,
)
from litestar.contrib.repository.exceptions import (
    NotFoundError as RepositoryNotFoundException,
)
from litestar.contrib.repository.exceptions import (
    RepositoryError as RepositoryException,
)
from litestar.exceptions import (
    HTTPException,
    InternalServerException,
    NotFoundException,
)
from litestar.middleware.exceptions.middleware import create_exception_response

if TYPE_CHECKING:
    from litestar.connection import Request
    from litestar.response import Response


class ConflictException(HTTPException):
    status_code = 409


def repository_exception_to_http_response(request: "Request", exc: RepositoryException) -> "Response":
    http_exc: type[HTTPException]
    if isinstance(exc, RepositoryNotFoundException):
        http_exc = NotFoundException
    elif isinstance(exc, RepositoryConflictException):
        http_exc = ConflictException
    else:
        http_exc = InternalServerException
    return create_exception_response(request, http_exc())
