import polars as pl
import numpy as np
from pathlib import Path


def transform_blast_to_functional_summary(input_path: Path, output_path: Path) -> None:
    df = pl.read_csv(
        input_path,
        separator="\t",
        has_header=False,
        new_columns=[
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
        ],
    )

    # Keep best hit per ORF (highest bitscore)
    best_hits = df.sort("bitscore", descending=True).group_by("orf_id").first()

    # Count how many ORFs map to each SwissProt accession
    functional_counts = (
        best_hits.group_by("accession")
        .agg(pl.count().alias("orf_count"))
        .sort("orf_count", descending=True)
    )

    # CLR transformation: normalize counts for multi-sample comparability
    counts = functional_counts["orf_count"].to_numpy().astype(float)
    log_counts = np.log(counts + 1)
    geometric_mean = np.exp(np.mean(log_counts))
    clr_values = np.log((counts + 1) / geometric_mean)

    functional_counts = functional_counts.with_columns(pl.Series("clr", clr_values))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    functional_counts.write_parquet(output_path)
