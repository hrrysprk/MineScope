# Experiment Tracking — Seqera Platform
**MineScope Architecture Decision Record**
**Supersedes: mlflow_integration_spec.md**

---

## Decision

Use Seqera Platform for pipeline monitoring and experiment tracking instead of MLflow.

**Why Seqera over MLflow:**

MLflow was designed for ML training runs — iterating on model parameters and comparing loss curves. This pipeline is a scientific computing workflow where the meaningful comparison is between annotation strategies across a spatially distributed dataset. Seqera was built for exactly this.

The critical difference is instrumentation. MLflow requires boilerplate inside every Python script — `log_params()`, `log_metrics()`, `start_run()`. That code lives in the codebase permanently, has to be maintained, and couples scientific scripts to an observability tool. Seqera operates at the Nextflow level — the Python scripts stay clean and do one thing: science. Observability is handled outside the code.

```
MLflow approach — instrumentation in every script
    Python script = science + tracking boilerplate

Seqera approach — instrumentation at pipeline level
    Python script = science only
    Nextflow + Seqera = tracking
```

---

## How It Works

One flag on the Nextflow run command sends everything to Seqera Tower:

```bash
nextflow run main.nf \
    -with-tower \
    -profile docker \
    --input_fastq data/bronze/metagenomics/SRR6189722.fastq
```

Seqera automatically captures:
- Full process execution graph
- CPU, memory, wall time per process
- Stdout and stderr logs per process
- Retry history and error messages
- Input and output file manifests
- Run parameters from nextflow.config

No code changes. No instrumentation. Works immediately.

---

## JSON Summary Output Strategy

Each pipeline stage writes a structured JSON summary alongside its Parquet output. Nextflow publishes these to the results directory. Seqera surfaces them as run artifacts.

Python scripts stay clean — JSON writing is the only observability concern inside the script, and it is science output not tracking boilerplate:

```python
# At the end of stage6_comparison.py — clean, no MLflow imports

import json
from datetime import datetime

def write_summary(params, metrics, output_path):
    summary = {
        "run_metadata": {
            "timestamp": datetime.utcnow().isoformat(),
            "dataset": "SRR6189722",
            "site": "Komsomolskaya_gold_mine_Kuzbass",
            "nextflow_run": os.environ.get("NXF_RUN_NAME", "local"),
            "annotation_db": "SwissProt_2024"
        },
        "parameters": {
            "ph_tolerance_range": params.ph_tolerance,
            "fe_threshold_mg_l": params.fe_threshold,
            "sulfate_threshold_mg_l": params.sulfate_threshold,
            "min_pathway_completion": params.min_completion,
            "esm2_model": params.esm2_model,
            "esm2_batch_size": params.esm2_batch_size,
            "knn_k": params.knn_k,
            "min_similarity_score": params.min_similarity,
            "blast_evalue_threshold": params.blast_evalue,
            "codon_kmer_size": params.kmer_size
        },
        "metrics": {
            "coverage": {
                "total_orfs": metrics.total_orfs,
                "metapathways_annotated": metrics.mp_annotated,
                "esm2_annotated": metrics.esm2_annotated,
                "annotation_coverage_metapathways": metrics.mp_coverage,
                "annotation_coverage_esm2": metrics.esm2_coverage
            },
            "comparison": {
                "confirmed_annotations": metrics.confirmed,
                "esm2_only_hits": metrics.esm2_only,
                "metapathways_only_hits": metrics.mp_only,
                "high_confidence_count": metrics.high_confidence
            },
            "pathway_completeness": {
                "pathways_complete": metrics.complete,
                "pathways_partial": metrics.partial,
                "pathways_absent": metrics.absent,
                "sulfur_oxidation_completion": metrics.sulfur,
                "iron_oxidation_completion": metrics.iron,
                "metal_efflux_completion": metrics.metal
            },
            "stress_gradient": {
                "amd_zone_coverage": metrics.amd_coverage,
                "transition_zone_coverage": metrics.transition_coverage,
                "flank_zone_coverage": metrics.flank_coverage
            }
        }
    }

    with open(output_path / "annotation_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
```

---

## Nextflow Process Configuration

Each process publishes its JSON summary and Parquet outputs. Seqera picks them up automatically.

```nextflow
// nextflow.config

tower {
    enabled  = true
    endpoint = 'https://tower.nf'     // or self-hosted Seqera instance
}

params {
    ph_tolerance        = 0.5
    fe_threshold        = 100
    sulfate_threshold   = 50
    min_completion      = 0.5
    esm2_model          = 'esm2_t33_650M'
    esm2_batch_size     = 32
    knn_k               = 10
    min_similarity      = 0.7
    blast_evalue        = 1e-5
    kmer_size           = 2
}
```

```nextflow
// modules/constrained_annotation.nf

process CONSTRAINED_ANNOTATION {
    tag "${workflow.runName}"
    publishDir "results/annotation/", mode: 'copy'

    input:
    path gold_parquet
    path metapathways_output
    path protein_sequences       // .faa from MetaPathways

    output:
    path "comparison_table.parquet"
    path "pathway_completion_map.parquet"
    path "annotation_summary.json"    // surfaced by Seqera as artifact
    path "esm2_embeddings.npy"

    script:
    """
    python stage1_chemistry_constraints.py \
        --gold ${gold_parquet} \
        --ph_tolerance ${params.ph_tolerance} \
        --fe_threshold ${params.fe_threshold}

    python stage2_metapathways_parser.py \
        --metapathways ${metapathways_output} \
        --blast_evalue ${params.blast_evalue}

    python stage3_pathway_completeness.py \
        --min_completion ${params.min_completion}

    python stage4_esm2_embeddings.py \
        --sequences ${protein_sequences} \
        --model ${params.esm2_model} \
        --batch_size ${params.esm2_batch_size}

    python stage5_constrained_search.py \
        --knn_k ${params.knn_k} \
        --min_similarity ${params.min_similarity} \
        --kmer_size ${params.kmer_size}

    python stage6_comparison.py \
        --run_name ${workflow.runName}
    """
}
```

---

## Local Development — No Seqera Account Needed

For local runs, drop the `-with-tower` flag. Nextflow runs normally. JSON summaries still write to results/. You can compare runs by reading the JSON files directly.

```bash
# Local run — no tower
nextflow run main.nf -profile docker \
    --input_fastq data/bronze/metagenomics/SRR6189722.fastq

# Local run — with tower monitoring (free tier)
nextflow run main.nf -profile docker -with-tower \
    --input_fastq data/bronze/metagenomics/SRR6189722.fastq

# Compare two annotation strategies locally
python scripts/compare_runs.py \
    results/run_happy_curie/annotation_summary.json \
    results/run_focused_darwin/annotation_summary.json
```

`compare_runs.py` reads both JSON summaries and prints a side-by-side metric comparison. Simple, no UI dependency, works offline.

---

## Production Deployment

Local dev to AWS Batch is zero config change. Seqera Batch Forge provisions the compute environment. Wave provisions containers. Fusion mounts S3 directly.

```bash
# Production run via Seqera Platform
# Triggered from Seqera UI or API — no local Nextflow needed

nextflow run main.nf \
    -profile aws \
    -with-tower \
    --input_fastq s3://koonkie-data/SRR6189722.fastq \
    --outdir s3://koonkie-results/
```

Same pipeline. Same parameters. Same JSON output format. Seqera handles compute, monitoring, and artifact storage.

---

## M-MAP Provenance Layer

The Seqera run ID replaces the MLflow run ID as the provenance anchor for M-MAP annotations. Every annotation traces back to the exact run that produced it.

```python
# src/domain/models/mmap_annotation.py

class MMapAnnotation(BaseModel):
    protein_id: str
    function: str
    confidence: float
    evidence_category: str         # confirmed / esm2_only / metapathways_only
    constraints_passed: list[str]  # which of the 4 constraints this survived
    seqera_run_id: str             # Seqera Tower run ID — full provenance link
    seqera_run_name: str           # human-readable e.g. happy_curie
    dataset: str                   # SRR accession or site ID
    site_chemistry: dict           # pH, Fe, sulfate at annotation site
    annotation_summary_path: str   # path to full JSON summary for this run
```

Every entry in M-MAP has a provenance chain:

```
site
  → chemistry measured
    → constraints applied (which of 4, with parameters)
      → evidence category (confirmed / esm2_only / mp_only)
        → Seqera run ID
          → full annotation_summary.json
            → exact Nextflow pipeline version and parameters
```

Reproducible, auditable, improvable. This is what separates M-MAP from SwissProt.

---

## Run Comparison Workflow

To compare two annotation strategies:

1. Run pipeline with strategy A parameters → produces `annotation_summary.json` A
2. Run pipeline with strategy B parameters → produces `annotation_summary.json` B
3. Open both runs in Seqera UI — process-level metrics compared side by side
4. Run `compare_runs.py` locally for metric-level comparison from the JSON files
5. The winning strategy's run ID becomes the provenance anchor for M-MAP annotations from that dataset

---

## What Seqera Shows Per Run

```
Pipeline graph
    Each process as a node
    Data flow as edges
    Execution status per node (running / complete / failed)

Process metrics
    CPU utilisation
    Memory usage
    Wall time
    I/O read/write

Logs
    Stdout and stderr per process
    Accessible without SSH

Parameters
    Full params block from nextflow.config
    Captured automatically

Artifacts
    annotation_summary.json surfaced as downloadable file
    comparison_table.parquet linked in results
```

All of this with zero instrumentation code in the Python scripts.
