import polars as pl
from pathlib import Path


def transform_lidar(input_path: Path, output_path: Path) -> None:
    df = pl.read_csv(input_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.write_parquet(output_path)
