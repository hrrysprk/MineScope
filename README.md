# MineScope

**Map microbial community activity onto the physical and chemical landscape of a mine site.**

![MineScope Dashboard](docs/hero1.png)

## Why This Matters

Acid mine drainage (AMD) is one of the most persistent environmental challenges in mining. When sulphide minerals are exposed to water and air, sulphur-oxidizing bacteria like *Acidithiobacillus thiooxidans* catalyze the production of sulfuric acid. This dissolves heavy metals (iron, arsenic, copper, zinc) into drainage water, contaminating downstream ecosystems for decades.

The key insight is that this isn't random. Physical terrain drives where water flows. Water flow drives where chemistry concentrates. Chemistry drives where microbial communities assemble. Understanding this spatial cascade is the difference between reactive cleanup and predictive management.

MineScope integrates three data streams (metagenomics sequencing, LiDAR terrain mapping, and soil chemistry) into a unified spatial model. Every grid cell on the mine site gets a complete profile: what the terrain looks like, what the chemistry is, and what the microbial community is doing. The result is a platform that shows not just *where* AMD is happening, but *why* it's happening there, and where it will happen next.

**[→ Live Dashboard](https://hrrysprk.github.io/MineScope/)** · **[→ Pipeline Diagram](https://hrrysprk.github.io/MineScope/#pipeline)**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Nextflow 26 + Wave Containers                       │
│                                                                             │
│  FASTQ ──→ MEGAHIT Assembly ──→ MetaPathways v3.5 ──→ BLAST output         │
│            (224K contigs)        (SwissProt annotation)  (220K hits)         │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Bronze     │    │   Silver     │    │    Gold      │
│  Raw data    │───▶│  Validated   │───▶│  Integrated  │──▶ Dashboard
│  + Pydantic  │    │  + Parquet   │    │  Spatial     │
│  validation  │    │  + CLR norm  │    │  Merge       │
└──────────────┘    └──────────────┘    └──────────────┘
       ▲                                        │
       │                                        ▼
  LiDAR Grid ─────────────────────────────▶ 2,505 cells × 18 columns
  Soil Chemistry ─────────────────────────▶ (x,y) spatial join
```

Three parallel data streams converge through a medallion architecture into a single gold layer. Each cell in the gold layer contains terrain topology, soil chemistry, and microbial functional annotation, all merged on spatial coordinates.

---

## Design Decisions

| Decision | Why |
|----------|-----|
| **Hexagonal ports & adapters** | Each data source gets its own adapter. If the LiDAR format changes from CSV to GeoTIFF, only the adapter changes. Domain logic stays untouched. |
| **Medallion layers (Bronze → Silver → Gold)** | Clear data lineage. Every value is traceable back to its raw source. Validation at every boundary catches corruption early. |
| **MetaPathways v3.5 containerized via Wave** | Koonkie's own pathway reconstruction tool, running in Docker with automatic multi-arch provisioning. Same pipeline runs on Apple Silicon, x86 servers, and cloud HPC without configuration changes. |
| **D8 flow direction encoding** | Industry-standard hydrology encoding (powers of 2 for 8 compass directions). Any GIS tool recognizes it. Derived from terrain aspect, tells us where water flows at every cell. |
| **Pydantic at every boundary** | Schema-as-code. Constraints encode domain knowledge: pH can't exceed 14, concentrations can't be negative, slope can't be negative. Bad data fails at ingestion, not silently downstream. |
| **Polars over Pandas** | Type-strict, native Parquet I/O, 5-10x faster. Aligns with the validation-first philosophy. |
| **Seqera Platform (Tower)** | Pipeline runs are tracked in [Seqera Cloud](https://cloud.seqera.io). Full provenance, monitoring, and scheduling for production deployment. |
| **CLR normalization in Silver** | Centered log-ratio transformation prepares functional counts for multi-sample comparison. Ready for when per-location metagenomes arrive. |

---

## Data Sources

| Stream | Source | Details |
|--------|--------|---------|
| Metagenomics | [SRR6189722](https://www.ncbi.nlm.nih.gov/sra/SRR6189722) (NCBI SRA) | Gold mine tailings metagenome, Kuzbass Russia. 454 GS FLX Titanium, single-end, 438K reads. Annotated with [MetaPathways v3.5](https://bitbucket.org/BCB2/metapathways/) (Hallam Lab, UBC). |
| LiDAR | Synthetic (realistic) | 50×50m grid at 1m resolution. Drainage channels, ridge lines, tailings mound, excavation pit. Based on published mine site topography. |
| Soil Chemistry | Synthetic (realistic) | 150 GPS-tagged samples. pH 1-5, Fe up to 6000 mg/L, As up to 800 mg/L. Values correlated with terrain drainage, based on published chemistry from the SRR6189722 paper. |

---

## Quick Start

**Prerequisites:** Python 3.12+, Node.js 18+, Docker, [Nextflow](https://nextflow.io), [uv](https://docs.astral.sh/uv/)

```bash
# Clone
git clone https://github.com/hrrysprk/MineScope.git
cd MineScope

# Install Python dependencies
uv sync

# Generate synthetic data
uv run python scripts/data_generation/generate_lidar.py
uv run python scripts/data_generation/generate_chemistry.py

# Run the data pipeline (bronze → silver → gold → dashboard JSON)
uv run python scripts/run_pipeline.py

# Start the dashboard
cd dashboard
npm install
npm run dev
# Open http://localhost:5173
```

**Full pipeline (requires Docker + reference databases):**
```bash
nextflow run main.nf -profile docker \
  --input_fastq data/bronze/metagenomics/SRR6189722.fastq
```

See [SETUP.md](SETUP.md) for database configuration and full pipeline setup.

---

## Pipeline Detail

### Nextflow Bioinformatics Pipeline

| Process | Tool | Input | Output |
|---------|------|-------|--------|
| `ASSEMBLE_READS` | MEGAHIT | Single-end FASTQ | Assembled contigs (FASTA) |
| `PATHWAY_PROFILING` | MetaPathways v3.5 | Contigs + SwissProt DB | Functional annotations (BLAST output) |

Conditional bypass: if pre-assembled contigs exist (`--input_fasta`), assembly is skipped. Supports both Docker and Conda execution profiles.

### Python Data Pipeline

| Layer | Transform | Output |
|-------|-----------|--------|
| Bronze → Silver (LiDAR) | CSV → Parquet | Validated terrain grid |
| Bronze → Silver (Chemistry) | CSV → Parquet | Validated sample points |
| Bronze → Silver (Metagenomics) | BLAST → best hit per ORF → functional counts + CLR | Normalized pathway abundance |
| Silver → Gold | Spatial join on (x, y) coordinates | Unified 2,505 × 18 Parquet |

---

## Biological Interpretation

The dashboard reveals the AMD spatial cascade:

1. **Elevation layer** — The drainage channel is visible as a blue-green trough running diagonally across the site. Water accumulates here.

2. **pH layer** — Acidity concentrates along the drainage path (pH 1.2-2.5 in the channel vs 4+ on ridges). This is where sulfuric acid pools.

3. **Iron layer** — Dissolved iron peaks where pH is lowest (>6000 mg/L in the channel). Classic AMD geochemistry signature.

4. **Pathway enrichment** — The top annotated functions from MetaPathways are biofilm signaling, heavy metal efflux, and cation resistance. These are survival strategies for organisms living in extreme metal/acid conditions.

The pattern confirms: **terrain → chemistry → biology**. The microbial community isn't randomly distributed. It's spatially organized by the physical and chemical landscape.

![Analytics View](docs/hero3.png)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Pipeline orchestration | Nextflow 26 + Wave containers |
| Pipeline monitoring | [Seqera Platform](https://cloud.seqera.io) (Tower) |
| Assembly | MEGAHIT (containerized) |
| Pathway annotation | MetaPathways v3.5 (containerized) |
| Data processing | Python 3.12, Polars, Pydantic |
| Package management | uv (lockfile-based reproducibility) |
| 3D Visualization | React, Three.js, React Three Fiber |
| Charts | D3.js |
| Deployment | GitHub Pages (static) |

---

## Project Structure

```
MineScope/
├── main.nf                    # Nextflow pipeline (assembly → annotation)
├── nextflow.config            # Wave containers, Docker/Conda profiles
├── modules/
│   ├── assemble_reads.nf      # MEGAHIT process
│   └── pathway_profiling.nf   # MetaPathways process
├── src/
│   ├── adapters/              # Hexagonal ports (one per data source)
│   │   ├── chemistry/reader.py
│   │   ├── lidar/reader.py
│   │   └── metagenomics/reader.py
│   ├── domain/models/         # Pydantic schemas
│   │   ├── chemistry.py
│   │   ├── lidar.py
│   │   └── pathway.py
│   └── layers/                # Medallion transforms
│       ├── silver/            # Validation + normalization
│       └── gold/              # Spatial merge
├── scripts/
│   ├── data_generation/       # Synthetic LiDAR + chemistry
│   └── run_pipeline.py        # Bronze → Silver → Gold orchestration
├── dashboard/                 # React + Three.js + D3
│   └── src/
│       ├── components/        # TerrainViewer, RadarChart, HeatmapGrid...
│       └── pages/             # Terrain, Analytics, Data, Pipeline
├── data/
│   ├── bronze/                # Raw inputs
│   ├── silver/                # Validated Parquet
│   └── gold/                  # Integrated spatial dataset
└── databases/                 # MetaPathways reference DBs (not in repo)
```

---

## Pipeline Launch (Interactive Configuration)

MineScope uses `nf-core launch` with a `nextflow_schema.json` for interactive pipeline configuration. Users run a single command and get walked through all options in the terminal:

```bash
nf-core launch ./
```

This presents an interactive form where users select their input types, data paths, and which pipeline stages to enable. No need to memorize CLI flags.

### Parameter Groups

**Input/Output (required)**

| Parameter | Description |
|-----------|-------------|
| `input_fastq` | Raw metagenomics FASTQ (null if using FASTA) |
| `input_fasta` | Pre-assembled contigs (skips MEGAHIT assembly) |
| `outdir` | Output directory |

**Amplicon (optional)**

| Parameter | Description |
|-----------|-------------|
| `amplicon_results` | Path to nf-core/ampliseq output directory. If provided, amplicon data gets merged into the gold layer. |

**Data Sources (optional)**

| Parameter | Description |
|-----------|-------------|
| `lidar` | Path to LiDAR terrain CSV |
| `chemistry` | Path to soil chemistry CSV |

**Execution**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `threads` | 4 | CPU threads per process |
| `db_path` | databases/ | Path to reference databases (SwissProt, SILVA) |

---

## Phase 2: Amplicon Pipeline

### Canonicalize to QIIME2 via nf-core/ampliseq

Rather than writing custom adapters for every amplicon format (FASTQ, BIOM, OTU tables, .qza), the approach is to canonicalize all inputs to QIIME2 artifacts first, then run a single standardized pipeline from there.

[nf-core/ampliseq](https://nf-co.re/ampliseq) already handles the heavy lifting: multi-format input, DADA2 denoising, taxonomic classification (SILVA 138), alpha/beta diversity, and PICRUSt2 functional prediction. It's maintained by 50+ contributors, tested across hundreds of datasets, and integrates with Seqera Platform out of the box.

**The integration plan:**

```
Any format (FASTQ, BIOM, OTU table, legacy pipeline output)
    → nf-core/ampliseq (DADA2, taxonomy, diversity, PICRUSt2)
        → QIIME2 artifacts with full provenance
            → Extraction adapter (QIIME2 → AmpliconSample domain model)
                → Gold layer spatial merge on (x, y)
```

**Why this approach:**
- QIIME2 ensures reproducibility. Every artifact carries its full provenance graph.
- DADA2, diversity metrics, and PICRUSt2 are battle-tested QIIME2 plugins. No need to reimplement them.
- Adding a new input format means writing one conversion step, not a full processing pipeline.
- nf-core/ampliseq handles the brutal edge cases (chimera removal, primer trimming per platform, index hopping, cross-talk filtering).
- Koonkie's clients likely already use QIIME2, so we meet them where they are.

**Tools:** nf-core/ampliseq, DADA2, SILVA 138, PICRUSt2, QIIME2, Nextflow DSL2, Seqera Platform

---

## Future Research: Geochemically-Constrained Annotation

This is a separate research project exploring whether environmental chemistry can improve functional annotation of novel proteins in extreme environments. It lives outside the production pipeline.

### The Problem

Up to 80% of organisms at an AMD site have no close relative in any reference database. BLAST against SwissProt searches a database built from well-studied lab organisms. The AMD community falls outside that reference space. Annotations come back sparse. Pathway reconstruction fails.

### The Insight

The environment itself constrains what biology is possible. At pH 1.5 with iron at 6,000 mg/L, the vast majority of metabolic strategies are thermodynamically impossible. Only a narrow set of pathways can operate. Only proteins with specific biophysical signatures can remain stable.

### Four Independent Constraints

1. **Sequence space** — What proteins are encoded? Standard ORF prediction from assembled contigs.
2. **Geochemical feasibility** — What can physically function at this chemistry? pH, temperature, and ion concentrations eliminate candidates that can't survive the measured conditions.
3. **Pathway completeness** — What's needed to close detected pathway fragments? Detecting steps 1, 2, and 4 of a cycle constrains what 3, 5, and 6 must look like.
4. **Metabolomics validation** — What products are actually present? LC-MS/MS for sulfur intermediates provides direct confirmation independent of sequence inference.

ESM2 (Meta's 650M-parameter protein language model) runs *after* these four filters reduce the candidate set from tens of thousands to a small, biologically coherent group. Foldseek + AlphaFold2 predicted structures provide structural alignment as additional evidence. The answer lives in the intersection of all constraints.

### Self-Supervised Error Learning

Once the constrained annotation pipeline has processed enough data, we accumulate cases where predictions were correct and incorrect. This creates a training signal, inspired by DADA2's error model:

1. Take fully annotated metagenomes where BLAST hit with high confidence (>90% identity, >80% coverage, e-value < 1e-50). These are near-certain ground truth.
2. Mask random ORFs from the annotation. Pretend they have no known function.
3. Run the constraint pipeline + ESM2 on the masked ORFs.
4. Compare predictions to the known ground truth.
5. Train a model that learns the systematic error patterns: when does ESM2 fail, under what conditions, and in what direction?

The model learns to reach correct annotations *without* needing high sequence similarity, which is exactly what's needed for novel organisms where BLAST fails. As M-MAP grows across mining sites, the error model improves. Each new site makes the system smarter not just by adding reference sequences, but by teaching it where the pipeline systematically fails.

**Tools:** ESM2, AlphaFold2, Foldseek, LC-MS/MS, k-NN embedding search, Seqera Platform

---

## Roadmap

- [ ] nf-core/ampliseq integration as Nextflow subworkflow
- [ ] QIIME2 artifact extraction adapter (→ AmpliconSample domain model → gold layer)
- [ ] Per-location metagenomes for true spatial resolution of functional profiles
- [ ] MetaCyc integration when institutional license access is resolved
- [ ] Time-series monitoring via Seqera Platform (scheduled pipeline runs + threshold alerts)
- [ ] AMD risk score: composite spatial index for predictive site management

---

## License

MIT
