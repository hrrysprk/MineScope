import polars as pl
from pathlib import Path
from src.domain.models.lidar import LidarPoint


def read_lidar_grid(filepath: Path) -> list[LidarPoint]:
    df = pl.read_csv(filepath)
    points = [LidarPoint(**row) for row in df.iter_rows(named=True)]
    return points