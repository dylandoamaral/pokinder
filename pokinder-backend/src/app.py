from litestar import Litestar
from litestar.config.allowed_hosts import AllowedHostsConfig
from litestar.config.compression import CompressionConfig
from litestar.config.cors import CORSConfig
from litestar.config.csrf import CSRFConfig
from litestar.contrib.repository.exceptions import (
    RepositoryError as RepositoryException,
)
from litestar.contrib.sqlalchemy.plugins import (
    SQLAlchemyAsyncConfig,
    SQLAlchemyInitPlugin,
)
from litestar.di import Provide
from litestar.logging import LoggingConfig
from litestar.middleware.base import DefineMiddleware
from litestar.middleware.logging import LoggingMiddlewareConfig
from litestar.middleware.rate_limit import RateLimitConfig
from litestar.openapi import OpenAPIConfig

from src.component.account import AccountController, use_postgres_account_dependency
from src.component.analytics import (
    AnalyticsController,
    use_postgres_analytics_dependency,
)
from src.component.creator import CreatorController, use_postgres_creator_dependency
from src.component.fusion import FusionController, use_postgres_fusion_dependency
from src.component.reference import (
    ReferenceController,
    use_postgres_reference_dependency,
)
from src.component.reference_family import (
    ReferenceFamilyController,
    use_postgres_reference_family_dependency,
)
from src.component.reference_proposal import (
    ReferenceProposalController,
    use_postgres_reference_proposal_dependency,
)
from src.component.vote import VoteController, use_postgres_vote_dependency
from src.security.middleware import JWTAuthenticationMiddleware
from src.shared.dependency.gmail_email_dependency import use_gmail_email_dependency
from src.utils.env import (
    retrieve_backend_host,
    retrieve_csrf_secret,
    retrieve_frontend_endpoint,
    retrieve_postgres_connection_string,
    retrieve_version,
)
from src.utils.exceptions import repository_exception_to_http_response

sqlalchemy_config = SQLAlchemyAsyncConfig(connection_string=retrieve_postgres_connection_string())
sqlalchemy_plugin = SQLAlchemyInitPlugin(config=sqlalchemy_config)

logging_config = LoggingConfig(
    root={"level": "INFO", "handlers": ["queue_listener"]},
    formatters={"standard": {"format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"}},
    log_exceptions="always",
)

jwt_middleware = DefineMiddleware(
    JWTAuthenticationMiddleware,
    exclude=[
        "schema",
        "account/login",
        "account/signup",
        "account/refresh",
        "creator",
    ],
)

rate_limit_middleware = RateLimitConfig(
    rate_limit=("second", 5),
    exclude=["/schema"],
).middleware

logging_middleware = LoggingMiddlewareConfig().middleware

app = Litestar(
    route_handlers=[
        VoteController,
        FusionController,
        AccountController,
        AnalyticsController,
        CreatorController,
        ReferenceController,
        ReferenceProposalController,
        ReferenceFamilyController,
    ],
    dependencies={
        "vote_dependency": Provide(use_postgres_vote_dependency, sync_to_thread=False),
        "fusion_dependency": Provide(use_postgres_fusion_dependency, sync_to_thread=False),
        "account_dependency": Provide(use_postgres_account_dependency, sync_to_thread=False),
        "analytics_dependency": Provide(use_postgres_analytics_dependency, sync_to_thread=False),
        "creator_dependency": Provide(use_postgres_creator_dependency, sync_to_thread=False),
        "reference_dependency": Provide(use_postgres_reference_dependency, sync_to_thread=False),
        "reference_proposal_dependency": Provide(use_postgres_reference_proposal_dependency, sync_to_thread=False),
        "reference_family_dependency": Provide(use_postgres_reference_family_dependency, sync_to_thread=False),
        "email_dependency": Provide(use_gmail_email_dependency, sync_to_thread=False),
    },
    exception_handlers={
        RepositoryException: repository_exception_to_http_response,  # type: ignore[dict-item]
    },
    logging_config=logging_config,
    csrf_config=CSRFConfig(secret=retrieve_csrf_secret(), cookie_name="XSRF-TOKEN", header_name="X-XSRF-TOKEN"),
    openapi_config=OpenAPIConfig(title="Pokinder", version=retrieve_version()),
    cors_config=CORSConfig(allow_origins=[retrieve_frontend_endpoint()], allow_credentials=True),
    plugins=[SQLAlchemyInitPlugin(config=sqlalchemy_config)],
    compression_config=CompressionConfig(backend="gzip", gzip_compress_level=9),
    allowed_hosts=AllowedHostsConfig(allowed_hosts=[retrieve_backend_host()]),
    middleware=[jwt_middleware, rate_limit_middleware, logging_middleware],
)
