from litestar.contrib.sqlalchemy.dto import SQLAlchemyDTO

from .reference_proposal_table import ReferenceProposal

DTO = SQLAlchemyDTO[ReferenceProposal]
ReturnDTO = SQLAlchemyDTO[ReferenceProposal]
