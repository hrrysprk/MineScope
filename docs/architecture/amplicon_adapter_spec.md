# Amplicon Multi-Format Adapter Extension
**MineScope Phase 2 Architecture Decision Record**

---

## Context

Thea Van Rossum (CSO, Koonkie) confirmed the actual project involves building a pipeline that accepts amplicon sequencing data in multiple file formats from different labs and instruments, normalizing them into a consistent data model for the nPhyla platform.

This is a direct extension of the hexagonal ports and adapters architecture already established in Phase 1. The pattern is identical — each input format gets its own adapter, the core pipeline logic operates on a shared domain model and never touches format-specific code.

Pipeline monitoring and experiment tracking uses Seqera Platform. See `seqera_tracking_spec.md`.

---

## Formats to Support

| Format | Source | Description |
|--------|--------|-------------|
| Raw FASTQ | Illumina MiSeq, NovaSeq | Raw paired-end amplicon reads, needs DADA2 denoising |
| QIIME2 artifact (.qza) | QIIME2 pipeline output | ZIP archive containing processed feature tables and metadata |
| OTU table (TSV) | Legacy pipelines, QIIME1 | Tab-separated, samples as columns, OTUs as rows |
| Feature table (BIOM) | QIIME2, Mothur, DADA2 | HDF5-based sparse matrix format, industry standard |
| Pre-processed diversity metrics | Various | Alpha/beta diversity already computed, needs normalization only |

---

## Shared Domain Model

All adapters normalize to a single `AmpliconSample` domain model. The core pipeline never sees format-specific code.

```python
# src/domain/models/amplicon.py

class AmpliconFeature(BaseModel):
    feature_id: str
    sequence: Optional[str]          # ASV or OTU representative sequence
    taxonomy: Optional[str]          # SILVA classification string
    confidence: Optional[float]      # taxonomic classification confidence

class AmpliconSample(BaseModel):
    sample_id: str
    site_x: float                    # spatial coordinate for gold layer join
    site_y: float
    ph: Optional[float]              # from paired soil chemistry if available
    sequencing_platform: str         # MiSeq, NovaSeq, 454, etc.
    target_region: str               # V3-V4, V4, ITS, etc.
    feature_counts: dict[str, int]   # feature_id -> read count
    features: list[AmpliconFeature]
    alpha_diversity: Optional[float] # Shannon, Simpson, etc.
    total_reads: int

    @validator('ph')
    def ph_must_be_valid(cls, v):
        if v is not None and not (0 <= v <= 14):
            raise ValueError('pH must be between 0 and 14')
        return v

    @validator('total_reads')
    def reads_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('total_reads must be positive')
        return v
```

---

## Adapter Structure

Follows identical pattern to existing LiDAR and chemistry adapters.

```
src/adapters/
    amplicon/
        __init__.py
        fastq_reader.py       # Raw FASTQ → AmpliconSample (via DADA2)
        qza_reader.py         # QIIME2 .qza → AmpliconSample
        otu_reader.py         # TSV OTU table → AmpliconSample
        biom_reader.py        # BIOM feature table → AmpliconSample
        diversity_reader.py   # Pre-computed metrics → AmpliconSample
```

Each adapter exposes a single function:

```python
def read(path: Path) -> list[AmpliconSample]:
    ...
```

The core pipeline calls `read()` and never knows which adapter ran.

---

## FASTQ Adapter — DADA2 Integration

Raw FASTQ requires the most processing. The adapter wraps DADA2 via rpy2 or calls it as a subprocess from a containerized R environment.

```
Raw FASTQ (paired-end)
        ↓
Quality filtering (DADA2 filterAndTrim)
        ↓
Error learning (DADA2 learnErrors)
        ↓
Denoising (DADA2 dada)
        ↓
Merging paired reads (DADA2 mergePairs)
        ↓
Chimera removal (DADA2 removeBimeraDenovo)
        ↓
ASV feature table
        ↓
Taxonomic classification against SILVA 138
        ↓
AmpliconSample domain model
```

**Design decision:** DADA2 runs in a Docker container managed by Nextflow, not called directly from Python. The Python adapter reads the DADA2 output files, not the raw FASTQ. This keeps the adapter stateless and testable without Docker.

---

## QIIME2 Adapter — .qza Handling

A .qza file is a ZIP archive with a specific internal structure:

```
artifact.qza/
    provenance/           # full pipeline provenance graph
    data/
        feature-table.biom   # the actual data
    metadata.yaml            # artifact type and UUID
```

The adapter unpacks the ZIP, reads the BIOM file inside, and maps to AmpliconSample. Provenance metadata is preserved as artifact lineage information.

```python
import zipfile
import biom

def read(path: Path) -> list[AmpliconSample]:
    with zipfile.ZipFile(path) as zf:
        biom_path = _find_biom(zf)
        table = biom.load_table(biom_path)
    return _biom_to_samples(table)
```

---

## BIOM Adapter

BIOM (Biological Observation Matrix) is HDF5-based. The `biom` Python package handles it directly.

```python
import biom

def read(path: Path) -> list[AmpliconSample]:
    table = biom.load_table(str(path))
    # table.ids('sample') → sample IDs
    # table.ids('observation') → feature IDs
    # table.to_dataframe() → Polars-compatible
    return _biom_to_samples(table)
```

---

## PICRUSt2 Integration — Functional Pathway Prediction

After taxonomic classification, PICRUSt2 predicts functional pathway activity from amplicon data using phylogenetic placement and ancestral state reconstruction.

```
AmpliconSample (ASV table + taxonomy)
        ↓
PICRUSt2 place_seqs.py
(phylogenetic placement of ASVs onto reference tree)
        ↓
PICRUSt2 hsp.py
(ancestral state reconstruction of gene content)
        ↓
PICRUSt2 metagenome_pipeline.py
(predicted metagenome — EC numbers, KO terms)
        ↓
PICRUSt2 pathway_pipeline.py
(MetaCyc pathway abundance predictions)
        ↓
Functional pathway profile per sample
        ↓
Silver layer → Gold spatial merge
```

PICRUSt2 runs in a Docker container via Nextflow. Output is a pathway abundance table that feeds directly into the existing gold layer spatial merge on (x, y) coordinates.

---

## Silver Layer Transforms

Each adapter produces raw AmpliconSample objects (Bronze). Silver transforms apply:

- Rarefaction to even sequencing depth across samples
- CLR normalization of feature counts (consistent with metagenomics silver layer)
- Taxonomic aggregation to genus/family level for spatial analysis
- Alpha diversity calculation (Shannon, observed features, Faith's PD)
- Beta diversity matrix (Bray-Curtis, UniFrac)

Output: validated Parquet files following existing medallion convention.

---

## Gold Layer Integration

AmpliconSample joins the existing gold layer on (x, y) spatial coordinates, adding:

```
New columns in gold layer:
  amplicon_shannon_diversity    float
  amplicon_observed_features    int
  amplicon_top_taxon            str     # dominant genus
  amplicon_acidithiobacillus    float   # relative abundance of key AMD taxon
  picrust2_sulfur_oxidation     float   # predicted pathway abundance
  picrust2_iron_oxidation       float
  picrust2_metal_efflux         float
```

This makes amplicon-derived functional predictions spatially comparable to metagenomics-derived annotations from MetaPathways — enabling direct validation of PICRUSt2 predictions against ground truth MetaPathways annotations on the same site.

---

## Nextflow Process Structure

```nextflow
workflow AMPLICON_PIPELINE {
    take: input_files   // channel of [format, path] tuples

    main:
    DETECT_FORMAT(input_files)
        | branch {
            fastq: it[0] == 'fastq'
            qza:   it[0] == 'qza'
            otu:   it[0] == 'otu'
            biom:  it[0] == 'biom'
          }
        | set { routed }

    PROCESS_FASTQ(routed.fastq)     // DADA2 container
    PROCESS_QZA(routed.qza)         // QIIME2 container
    PROCESS_OTU(routed.otu)         // Python only
    PROCESS_BIOM(routed.biom)       // Python only

    NORMALIZE_TO_DOMAIN(           // produces AmpliconSample Parquet
        PROCESS_FASTQ.out
        | mix(PROCESS_QZA.out)
        | mix(PROCESS_OTU.out)
        | mix(PROCESS_BIOM.out)
    )

    PICRUST2(NORMALIZE_TO_DOMAIN.out)   // functional prediction

    SILVER_TRANSFORM(PICRUST2.out)       // CLR norm, rarefaction

    GOLD_MERGE(SILVER_TRANSFORM.out)     // spatial join
}
```

---

## Why This Architecture

The hexagonal pattern means adding a new format — say, a direct Mothur output or a Nanopore long-read amplicon format — requires writing one new adapter file. Nothing else changes. The domain model, silver transforms, gold merge, and Nextflow pipeline are all format-agnostic.

This is the same argument made for the LiDAR and chemistry adapters in Phase 1. It scales to any number of input formats Koonkie encounters across different mining clients using different sequencing platforms and bioinformatics pipelines.

---

## Open Questions for Implementation

1. Does Koonkie already have a preferred DADA2 parameter set for their amplicon runs or should defaults follow QIIME2 tutorials
2. Which target region — V3-V4 is most common for environmental samples but confirm with Thea
3. SILVA 138 is already in the databases/ directory from MetaPathways — confirm it is the right build for DADA2 taxonomic classification
4. PICRUSt2 requires a reference phylogenetic tree — confirm which version and where to source it
