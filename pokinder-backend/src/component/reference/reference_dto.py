from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO

from .reference_table import Reference

DTO = SQLAlchemyDTO[Reference]
ReturnDTO = SQLAlchemyDTO[Reference]
