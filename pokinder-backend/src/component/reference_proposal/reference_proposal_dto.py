from typing import Annotated

from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO
from litestar.dto import DTOConfig

from .reference_proposal_table import ReferenceProposal

DTO = SQLAlchemyDTO[ReferenceProposal]
ReturnDTO = SQLAlchemyDTO[ReferenceProposal]

returnDTOListConfig = DTOConfig(
    max_nested_depth=3,
    exclude={
        "fusion.head",
        "fusion.body",
        "fusion.creators",
    },
)
ReturnDTOList = SQLAlchemyDTO[Annotated[ReferenceProposal, returnDTOListConfig]]
