from pydantic import BaseModel
from pydantic.generics import GenericModel
from typing import Generic, TypeVar, Optional

T = TypeVar("T")

class ResponseModel(GenericModel, Generic[T]):
    success: bool = True
    message: str = "Operation successful"
    data: Optional[T] = None

class HealthResponse(BaseModel):
    status: str
    postgres: str
    mongodb: str
    redis: str