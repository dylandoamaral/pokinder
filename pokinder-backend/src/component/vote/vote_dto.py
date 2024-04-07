from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from .vote_table import Vote

DTO = SQLAlchemyDTO[Vote]
ReturnDTO = SQLAlchemyDTO[Vote]
