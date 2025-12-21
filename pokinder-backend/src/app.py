from litestar import Litestar, Request
from litestar.config.allowed_hosts import AllowedHostsConfig
from litestar.config.compression import CompressionConfig
from litestar.config.cors import CORSConfig
from litestar.config.csrf import CSRFConfig
from litestar.config.response_cache import (
    ResponseCacheConfig,
    default_cache_key_builder,
)
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
from litestar.plugins.prometheus import PrometheusConfig, PrometheusController
from litestar.stores.redis import RedisStore

from src.component.account import AccountController, use_account_dependency_postgres
from src.component.analytics import (
    AnalyticsController,
    use_analytics_dependency_postgres,
)
from src.component.creator import CreatorController, use_creator_dependency_postgres
from src.component.explore import ExploreController, use_explore_dependency_postgres
from src.component.fusion import FusionController, use_fusion_dependency_postgres
from src.component.reference import (
    ReferenceController,
    use_reference_dependency_postgres,
)
from src.component.reference_family import (
    ReferenceFamilyController,
    use_reference_family_dependency_postgres,
)
from src.component.reference_proposal import (
    ReferenceProposalController,
    use_reference_proposal_dependency_postgres,
)
from src.component.vote import VoteController, use_vote_dependency_postgres
from src.security.middleware import API_KEY_HEADER, JWTAuthenticationMiddleware
from src.shared.dependency.email_dependency_gmail import use_email_dependency_gmail
from src.shared.dependency.notification_dependency_discord import (
    use_notification_dependency_discord,
)
from src.shared.dependency.statistics_dependency_postgres_redis import (
    use_statistics_dependency_postgres_redis,
)
from src.utils.env import (
    retrieve_backend_host,
    retrieve_csrf_secret,
    retrieve_frontend_endpoint,
    retrieve_postgres_connection_string,
    retrieve_redis_endpoint,
    retrieve_version,
)
from src.utils.exceptions import repository_exception_to_http_response

sqlalchemy_config = SQLAlchemyAsyncConfig(connection_string=retrieve_postgres_connection_string())
sqlalchemy_plugin = SQLAlchemyInitPlugin(config=sqlalchemy_config)

redis_store = RedisStore.with_client(url=retrieve_redis_endpoint(), port=6379, db=0)
cache_store = redis_store.with_namespace("cache")
statistics_store = redis_store.with_namespace("statistics")


def key_builder(request: Request) -> str:
    return default_cache_key_builder(request) + request.headers.get(API_KEY_HEADER, "")


response_cache_config = ResponseCacheConfig(key_builder=key_builder, store="cache")
rate_limit_middleware = RateLimitConfig(rate_limit=("second", 5), exclude=["/schema"], store="cache").middleware

logging_config = LoggingConfig(
    root={"level": "INFO", "handlers": ["queue_listener"]},
    formatters={"standard": {"format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"}},
    log_exceptions="always",
)

prometheus_config = PrometheusConfig(
    app_name="pokinder",
    prefix="litestar",
    group_path=True,
)

jwt_middleware = DefineMiddleware(
    JWTAuthenticationMiddleware,
    exclude=[
        "schema",
        "account/login",
        "account/signup",
        "account/refresh",
        "creator",
        "metrics",
    ],
)

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
        ExploreController,
        PrometheusController,
    ],
    dependencies={
        "vote_dependency": Provide(use_vote_dependency_postgres, sync_to_thread=False),
        "fusion_dependency": Provide(use_fusion_dependency_postgres, sync_to_thread=False),
        "account_dependency": Provide(use_account_dependency_postgres, sync_to_thread=False),
        "analytics_dependency": Provide(use_analytics_dependency_postgres, sync_to_thread=False),
        "creator_dependency": Provide(use_creator_dependency_postgres, sync_to_thread=False),
        "reference_dependency": Provide(use_reference_dependency_postgres, sync_to_thread=False),
        "reference_proposal_dependency": Provide(use_reference_proposal_dependency_postgres, sync_to_thread=False),
        "reference_family_dependency": Provide(use_reference_family_dependency_postgres, sync_to_thread=False),
        "explore_dependency": Provide(use_explore_dependency_postgres, sync_to_thread=False),
        "email_dependency": Provide(use_email_dependency_gmail, sync_to_thread=False),
        "notification_dependency": Provide(use_notification_dependency_discord, sync_to_thread=False),
        "statistics_dependency": Provide(use_statistics_dependency_postgres_redis, sync_to_thread=False),
    },
    stores={
        "cache": cache_store,
        "statistics": statistics_store,
    },
    exception_handlers={
        RepositoryException: repository_exception_to_http_response,  # type: ignore[dict-item]
    },
    logging_config=logging_config,
    response_cache_config=response_cache_config,
    # csrf_config=CSRFConfig(secret=retrieve_csrf_secret(), cookie_name="XSRF-TOKEN", header_name="X-XSRF-TOKEN"),
    openapi_config=OpenAPIConfig(title="Pokinder", version=retrieve_version()),
    cors_config=CORSConfig(allow_origins=[retrieve_frontend_endpoint()], allow_credentials=True),
    plugins=[SQLAlchemyInitPlugin(config=sqlalchemy_config)],
    compression_config=CompressionConfig(backend="gzip", gzip_compress_level=9),
    allowed_hosts=AllowedHostsConfig(allowed_hosts=[retrieve_backend_host()]),
    middleware=[jwt_middleware, rate_limit_middleware, logging_middleware],
)
