import uvicorn
from litestar import Litestar
from litestar.config.compression import CompressionConfig
from litestar.config.cors import CORSConfig
from litestar.contrib.repository.exceptions import (
    RepositoryError as RepositoryException,
)
from litestar.contrib.sqlalchemy.plugins import (
    SQLAlchemyAsyncConfig,
    SQLAlchemyInitPlugin,
)
from litestar.di import Provide
from litestar.middleware.base import DefineMiddleware
from litestar.openapi import OpenAPIConfig

from src.component.account import AccountController, use_postgres_account_dependency
from src.component.analytics import (
    AnalyticsController,
    use_postgres_analytics_dependency,
)
from src.component.creator import CreatorController, use_postgres_creator_dependency
from src.component.fusion import FusionController, use_postgres_fusion_dependency
from src.component.vote import VoteController, use_postgres_vote_dependency
from src.security.middleware import JWTAuthenticationMiddleware
from src.utils.env import (
    retrieve_frontend_endpoint,
    retrieve_postgres_connection_string,
    retrieve_version,
)
from src.utils.exceptions import repository_exception_to_http_response

sqlalchemy_config = SQLAlchemyAsyncConfig(connection_string=retrieve_postgres_connection_string())
sqlalchemy_plugin = SQLAlchemyInitPlugin(config=sqlalchemy_config)

app = Litestar(
    route_handlers=[
        VoteController,
        FusionController,
        AccountController,
        AnalyticsController,
        CreatorController,
    ],
    dependencies={
        "vote_dependency": Provide(use_postgres_vote_dependency, sync_to_thread=False),
        "fusion_dependency": Provide(use_postgres_fusion_dependency, sync_to_thread=False),
        "account_dependency": Provide(use_postgres_account_dependency, sync_to_thread=False),
        "analytics_dependency": Provide(use_postgres_analytics_dependency, sync_to_thread=False),
        "creator_dependency": Provide(use_postgres_creator_dependency, sync_to_thread=False),
    },
    exception_handlers={
        RepositoryException: repository_exception_to_http_response,  # type: ignore[dict-item]
    },
    openapi_config=OpenAPIConfig(title="Pokinder", version=retrieve_version()),
    cors_config=CORSConfig(allow_origins=[retrieve_frontend_endpoint()]),
    plugins=[SQLAlchemyInitPlugin(config=sqlalchemy_config)],
    compression_config=CompressionConfig(backend="gzip", gzip_compress_level=9),
    middleware=[
        DefineMiddleware(
            JWTAuthenticationMiddleware,
            exclude=[
                "schema",
                "account/login",
                "account/signup",
                "account/refresh",
                "creator",
            ],
        )
    ],
)
