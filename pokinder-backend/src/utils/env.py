import os
from pathlib import Path

from dotenv import load_dotenv


def load_pokinder_dotenv():
    dotenv_path = Path(os.curdir).resolve().parent / ".env"
    load_dotenv(dotenv_path=dotenv_path)


def retrieve_postgres_connection_string() -> str:
    load_pokinder_dotenv()
    postgres_host = os.getenv("POSTGRES_HOST")
    postgres_password = os.getenv("POSTGRES_PASSWORD")
    postgres_db = os.getenv("POSTGRES_DB")
    return f"postgresql+asyncpg://postgres:{postgres_password}@{postgres_host}:5432/{postgres_db}"
