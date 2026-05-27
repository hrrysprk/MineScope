"""Domain model for amplicon sequencing data."""
from typing import Any

from pydantic import BaseModel, Field

class AmpliconSample(BaseModel):
    """
    Standardized representation of one amplicon sample.

    All amplicon adapters (FASTQ, QIIME2, OTU table, BIOM, diversity)
    produce this same shape. Downstream code never knows which format
    the data originally came from.
    """

    sample_id: str
    x: float = Field(ge=0, description="Spatial x coordinate")
    y: float = Field(ge=0, description="Spatial y coordinate")
    taxa_counts: dict[str, int] = Field(
        description="Taxon ID -> read count mapping"
    )
    total_reads: int = Field(ge=0)
    metadata: dict[str, Any] = Field(default_factory=dict)