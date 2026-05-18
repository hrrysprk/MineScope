import polars as pl
from pathlib import Path
from src.domain.models.chemistry import SoilSample


def read_soil_chemistry(filepath: str) -> list[SoilSample]:
    df = pl.read_csv(filepath)
    samples = [SoilSample(**row) for row in df.iter_rows(named=True)]
    return samples