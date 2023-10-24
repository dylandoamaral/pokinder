from pydantic import BaseModel as _BaseModel


class BaseModel(_BaseModel):
    model_config = {"from_attributes": True}
