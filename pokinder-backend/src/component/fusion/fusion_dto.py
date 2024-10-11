from typing import Annotated

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.dto import DTOConfig

from .fusion_table import Fusion

DTO = SQLAlchemyDTO[Fusion]
ReturnDTO = SQLAlchemyDTO[Fusion]

returnDTODrawConfig = DTOConfig(max_nested_depth=2, exclude={"head.families", "body.families"})
ReturnDTODraw = SQLAlchemyDTO[Annotated[Fusion, returnDTODrawConfig]]
