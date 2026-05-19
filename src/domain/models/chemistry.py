from pydantic import BaseModel, Field


class SoilSample(BaseModel):
    x: float = Field(ge=0, le=50)
    y: float = Field(ge=0, le=50)
    pH: float = Field(gt=0, le=14)
    fe_mg_l: float = Field(ge=0)
    cu_mg_l: float = Field(ge=0)
    as_mg_l: float = Field(ge=0)
    zn_mg_l: float = Field(ge=0)
    moisture_pct: float = Field(ge=0, le=100)
    sulfate_mg_l: float = Field(ge=0)
