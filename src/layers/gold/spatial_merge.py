import polars as pl
from pathlib import Path


def merge_spatial_data(
    lidar_path: Path,
    chemistry_path: Path,
    metagenomics_path: Path,
    output_path: Path,
) -> None:
    lidar = pl.read_parquet(lidar_path)
    chemistry = pl.read_parquet(chemistry_path)
    metagenomics = pl.read_parquet(metagenomics_path)

    # Round chemistry coordinates to nearest integer for grid join
    chemistry = chemistry.with_columns(
        pl.col("x").round(0).cast(pl.Int64).alias("grid_x"),
        pl.col("y").round(0).cast(pl.Int64).alias("grid_y"),
    )

    # Cast lidar coordinates to int for join
    lidar = lidar.with_columns(
        pl.col("x").cast(pl.Int64).alias("grid_x"),
        pl.col("y").cast(pl.Int64).alias("grid_y"),
    )

    # Join chemistry onto lidar grid
    merged = lidar.join(chemistry, on=["grid_x", "grid_y"], how="left")

    # Add total functional richness as a column
    functional_richness = metagenomics.shape[0]
    merged = merged.with_columns(
        pl.lit(functional_richness).alias("functional_richness")
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    merged.write_parquet(output_path)
