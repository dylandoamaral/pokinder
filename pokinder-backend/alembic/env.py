import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config


# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from src.component.account import Account  # noqa
from src.component.creator import Creator  # noqa
from src.component.family import Family  # noqa
from src.component.fusion import Fusion  # noqa
from src.component.pokemon import Pokemon  # noqa
from src.component.pokemon_family import PokemonFamily  # noqa
from src.component.reference import Reference  # noqa
from src.component.reference_family import ReferenceFamily  # noqa
from src.component.reference_proposal import ReferenceProposal  # noqa
from src.component.vote import Vote  # noqa
from src.utils.env import retrieve_postgres_connection_string
from src.utils.sqlalchemy import BaseTable

target_metadata = [BaseTable.metadata]

# other values from the config, defined by the needs of env.py,
# can be acquired:
config.set_main_option(
    "sqlalchemy.url",
    retrieve_postgres_connection_string(local=False),
)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL and not an Engine,
    though an Engine is acceptable here as well.  By skipping the Engine
    creation we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the script
    output.
    """
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine and associate a
    connection with the context.
    """
    configuration = config.get_section(config.config_ini_section)
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
