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


def retrieve_postgres_connection_string() -> str:
    load_pokinder_dotenv()
    postgres_host = get_env_named_("POSTGRES_HOST")
    postgres_password = get_env_named_("POSTGRES_PASSWORD")
    postgres_db = get_env_named_("POSTGRES_DB")
    return f"postgresql+asyncpg://postgres:{postgres_password}@{postgres_host}:5432/{postgres_db}"


def retrieve_frontend_endpoint() -> str:
    load_pokinder_dotenv()
    frontend_host = get_env_named_("FRONTEND_HOST")

    if frontend_host == "localhost":
        return "http://localhost:3000"
    else:
        return f"https://{frontend_host}"


def retrieve_version() -> str:
    load_pokinder_dotenv()
    return get_env_named_("VERSION")


def retrieve_jwt_secret() -> str:
    load_pokinder_dotenv()
    return get_env_named_("JWT_SECRET")
