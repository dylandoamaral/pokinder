from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO

from .fusion_table import Fusion


DTO = SQLAlchemyDTO[Fusion]
ReturnDTO = SQLAlchemyDTO[Fusion]
