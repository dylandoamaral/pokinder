from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from .creator_table import Creator

DTO = SQLAlchemyDTO[Creator]
ReturnDTO = SQLAlchemyDTO[Creator]
