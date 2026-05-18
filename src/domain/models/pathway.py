from pydantic import BaseModel, Field


class PathwayHit(BaseModel):
    """Fields map directly to BLAST output."""
    orf_if: str
    accession: str
    indentity_pct: float = Field(ge=0, le=100)
    alignment_length: int = Field(gt=0)
    evalue: float = Field(ge=0)
    bitscore: float = Field(ge=0)