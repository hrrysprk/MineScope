from pydantic import BaseModel, Field


class LidarPoint(BaseModel):
    x: float = Field(ge=0, le=50)
    y: float = Field(ge=0, le=50)
    elevation: float
    slope: float = Field(ge=0, le=90)
    aspect: float = Field(ge=0, le=360)
    flow_direction: int
