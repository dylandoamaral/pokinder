from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO

from .account_table import Account

DTO = SQLAlchemyDTO[Account]
returnDTO = SQLAlchemyDTO[Account]
