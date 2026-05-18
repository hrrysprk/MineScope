# MineScope

Integrated geospatial pipeline for mapping microbial community activity onto the physical and chemical landscape of a mine site.

Combines three data streams — metagenomics, LiDAR terrain, and soil chemistry — into a unified spatial dataset with an interactive 3D dashboard.

## Architecture

```
FASTQ → Nextflow (MEGAHIT + MetaPathways) → Bronze → Silver → Gold → Dashboard
LiDAR CSV → Pydantic validation → Bronze → Silver → Gold ↗
Chemistry CSV → Pydantic validation → Bronze → Silver → Gold ↗
```

## Tech Stack

- **Pipeline orchestration:** Nextflow 26 + Wave containers
- **Bioinformatics:** MEGAHIT (assembly), MetaPathways v3.5 (pathway annotation)
- **Data processing:** Python, Polars, Pydantic
- **Visualization:** React, Three.js (3D terrain), D3.js (charts)
- **Package management:** uv

## Quick Start

```bash
uv sync
uv run python scripts/run_pipeline.py
cd dashboard && npm install && npm run dev
```

See [SETUP.md](SETUP.md) for full setup instructions including database configuration.
