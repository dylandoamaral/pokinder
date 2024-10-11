from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO

from .reference_family_table import ReferenceFamily

DTO = SQLAlchemyDTO[ReferenceFamily]
ReturnDTO = SQLAlchemyDTO[ReferenceFamily]
