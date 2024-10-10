from src.component.account.account_table import AccountRole
from src.security import Request
from litestar.exceptions import NotAuthorizedException
from litestar.handlers.base import BaseRouteHandler


def admin_only(request: Request, _: BaseRouteHandler) -> None:
    if request.user.role != AccountRole.ADMIN:
        raise NotAuthorizedException()
