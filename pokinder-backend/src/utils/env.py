import os
from pathlib import Path

from dotenv import load_dotenv


# This function is only used in local mode without using docker
def load_pokinder_dotenv():
    dotenv_path = Path(os.curdir).resolve().parent.parent / "configuration" / ".env"
    load_dotenv(dotenv_path=dotenv_path)
    dotenv_path = Path(os.curdir).resolve().parent.parent / "configuration" / ".env.shared"
    load_dotenv(dotenv_path=dotenv_path)


def retrieve_postgres_connection_string() -> str:
    load_pokinder_dotenv()
    postgres_host = os.getenv("POSTGRES_HOST")
    postgres_password = os.getenv("POSTGRES_PASSWORD")
    postgres_db = os.getenv("POSTGRES_DB")
    return f"postgresql+asyncpg://postgres:{postgres_password}@{postgres_host}:5432/{postgres_db}"


def retrieve_frontend_endpoint() -> str:
    load_pokinder_dotenv()
    frontend_host = os.getenv("FRONTEND_HOST")
    return f"https://{frontend_host}"


def retrieve_version() -> str:
    load_pokinder_dotenv()
    return os.getenv("VERSION")
