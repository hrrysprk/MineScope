import polars as pl
from src.domain.models.pathway import PathwayHit


BLAST_COLUMNS = [
    "orf_id",
    "accession",
    "identity_pct",
    "alignment_length",
    "mismatches",
    "gap_opens",
    "q_start",
    "q_end",
    "s_start",
    "s_end",
    "evalue",
    "bitscore",
]


def read_blast_output(filepath: str) -> list[PathwayHit]:
    df = pl.read_csv(
        filepath, separator="\t", has_header=False, new_columns=BLAST_COLUMNS
    )
    keep = [
        "orf_id",
        "accession",
        "identity_pct",
        "alignment_length",
        "evalue",
        "bitscore",
    ]
    df = df.select(keep)
    hits = [PathwayHit(**row) for row in df.iter_rows(named=True)]
    return hits
