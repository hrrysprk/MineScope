"""Adapter that reads OTU table TSV files into AmpliconSample objects."""

import polars as pl
from pathlib import Path

from src.domain.models.amplicon import AmpliconSample

def _load_sample_coords(metadata_path: Path) -> dict[str, tuple[float, float]]:
    """
    Load sample spatial coordinates from a metadata TSV.

    Args:
        metadata_path: Path to TSV with columns: sample_id, x, y.

    Returns:
        Mapping of sample_id to (x, y) coordinate tuple.
    """
    df = pl.read_csv(metadata_path, separator="\t")
    return {
        row["sample_id"]: (row["x"], row["y"])
        for row in df.iter_rows(named=True)
    }

def read_otu_table(
    otu_path: Path, 
    metadata_path: Path
    ) -> list[AmpliconSample]:
    """
    Read an OTU table TSV and produce AmpliconSample objects.

    Args:
        out_path: Path to OTU table (taxa as rows, samples as columns).
        metadata_path: Path to sample metadata TSV with x, y coords.

    Returns:
        One AmpliconSample per sample column in the OTU table.
    """
    coords = _load_sample_coords(metadata_path)
    df = pl.read_csv(otu_path, separator="\t", comment_prefix="#")
    
    taxa_col = df.columns[0]
    sample_columns = df.columns[1:]
    samples: list[AmpliconSample] = []

    for sample_id in sample_columns:
        if sample_id not in coords:
            raise KeyError(
                f"Sample '{sample_id}' not found in metadata file"
            )
        x, y = coords[sample_id]
        taxa_counts = dict(
            zip(df[taxa_col].to_list(), df[sample_id].to_list())
        )
        total_reads = sum(taxa_counts.values())
        samples.append(
            AmpliconSample(
                sample_id=sample_id,
                x=x,
                y=y,
                taxa_counts=taxa_counts,
                total_reads=total_reads
            )
        )

    return samples