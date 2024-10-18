import os
from pathlib import Path

from dotenv import load_dotenv


# This function is only used in local mode without using docker
def load_pokinder_dotenv():
    dotenv_path = Path(os.curdir).resolve().parent / "configuration" / ".env"
    load_dotenv(dotenv_path=dotenv_path)
    dotenv_path = Path(os.curdir).resolve().parent / "configuration" / ".env.shared"
    load_dotenv(dotenv_path=dotenv_path)
    dotenv_path = Path(os.curdir).resolve().parent.parent / "configuration" / ".env"
    load_dotenv(dotenv_path=dotenv_path)
    dotenv_path = Path(os.curdir).resolve().parent.parent / "configuration" / ".env.shared"
    load_dotenv(dotenv_path=dotenv_path)


def get_env_named_(name):
    value = os.getenv(name)

    if not value:
        raise Exception(f"The env {name} is missing !")

    return value


def retrieve_postgres_connection_string(local=False) -> str:
    load_pokinder_dotenv()
    postgres_host = get_env_named_("POSTGRES_HOST") if not local else "localhost"
    postgres_password = get_env_named_("POSTGRES_PASSWORD")
    postgres_db = get_env_named_("POSTGRES_DB")
    return f"postgresql+asyncpg://postgres:{postgres_password}@{postgres_host}:5432/{postgres_db}"


def retrieve_backend_host() -> str:
    load_pokinder_dotenv()
    backend_host = get_env_named_("BACKEND_HOST")

    return backend_host


def retrieve_frontend_endpoint() -> str:
    load_pokinder_dotenv()
    frontend_host = get_env_named_("FRONTEND_HOST")

    if frontend_host == "localhost":
        return "http://localhost:3000"
    else:
        return f"https://{frontend_host}"


def retrieve_redis_endpoint() -> str:
    load_pokinder_dotenv()
    redis_host = get_env_named_("REDIS_HOST")
    redis_password = get_env_named_("REDIS_PASSWORD")

    return f"redis://:{redis_password}@{redis_host}:6379/"


def retrieve_version() -> str:
    load_pokinder_dotenv()
    return get_env_named_("VERSION")


def retrieve_jwt_secret() -> str:
    load_pokinder_dotenv()
    return get_env_named_("JWT_SECRET")


def retrieve_csrf_secret() -> str:
    load_pokinder_dotenv()
    return get_env_named_("CSRF_SECRET")


def retrieve_gmail_email() -> str:
    load_pokinder_dotenv()
    return get_env_named_("GMAIL_EMAIL")


def retrieve_gmail_password() -> str:
    load_pokinder_dotenv()
    return get_env_named_("GMAIL_PASSWORD")
