# MineScope — Project Context and Mission

## Who I Am

I am Harpreet Singh, a computational biologist and ML engineer completing a Master of Data Science at UBC (expected May 2026). I have 4+ years of research experience, 3 peer-reviewed publications in Nature NPJ Aging, BMC Genomics, and Genetics, and extensive experience building production-scale bioinformatics pipelines. My GitHub is github.com/hrrysprk and my portfolio is hrrysprk.com.

My relevant projects:
- **spaceGen:** Single-cell multiome ML pipeline on NASA spaceflight data using Scanpy, CellTypist, MuData, MLflow with hexagonal architecture and bronze/silver/gold medallion layers
- **ChromApipe:** Cloud-native Nextflow pipeline on AWS Batch analyzing 3D chromosome structures across all 22 autosomes with Wave containers and Fusion file system
- **GenBrowser:** Interactive 3D point cloud visualization dashboard mapping biological metrics onto chromosome structures using Three.js and TypeScript

---

## Why I Am Building This

I have a job interview on Tuesday May 19th, 2026 at 12 PM PST with Koonkie Canada Inc. The interviewers are:
- **Thea Van Rossum** (Chief Science Officer)
- **Erin Marshall** (Chief Operating Officer, PhD)

I already passed the technical interview with **Tomer Altman** (Head of Engineering). During that interview Tomer asked me how I would integrate FASTQ metagenomics data, LiDAR point cloud data from drones, and soil chemistry high throughput CSV data on cloud into a meaningful unified platform. I am building MineScope as a direct answer to that question.

I was introduced to Koonkie by **Professor Steven Hallam** (UBC, Founding Director ECOSCOPE, Leopold Leadership Fellow) who is Koonkie's scientific founder and backer. He personally introduced me to the leadership team after a conversation about bioinformatics opportunities in the mining microbiome space.

Koonkie is transitioning from a startup to a platform with approximately $9 million in Digital Supercluster funding. The core product is called **nPhyla/M-MAP**, a platform for mining companies integrating microbial community data with physical and chemical site data. Their core bioinformatics tool is **MetaPathways v3.5** developed by the Hallam Lab.

I believe this project may be directly relevant to the work I would do if hired at Koonkie. Building it before the interview demonstrates initiative, execution speed, and genuine understanding of their technical stack.

---

## What MineScope Is

MineScope is an integrated data pipeline and visualization platform that combines three data streams from mine sites:

**1. Metagenomics (FASTQ)**
Raw sequencing data from soil samples at the mine site. Processed through MetaPathways v3.5 to reconstruct metabolic pathway activity at the community level. The key biological story is that sulphur-oxidizing and iron-oxidizing bacteria like Acidithiobacillus thiooxidans drive acid mine drainage. Their metabolic activity correlates with low pH zones, high iron and sulphur concentrations, and specific terrain topology.

**2. LiDAR Point Cloud (terrain topology)**
Drone-based LiDAR scanning produces a 3D point cloud of the mine site. Processed to extract topological features per grid cell: elevation, slope, aspect, and flow direction using D8 hydrological encoding. Physical topology drives drainage patterns which drive chemical conditions which drive microbial community assembly.

**3. Soil Chemistry (high throughput CSV)**
Chemical assay data per grid cell: pH, iron, copper, arsenic, zinc, moisture, and sulfate concentrations. The abiotic chemical environment is the mediating variable between physical topology and biological community.

**The core biological insight:**
Physical space (LiDAR topology) → Chemical conditions (soil chemistry) → Microbial community assembly (metagenomics) → Biogeochemical cycles (pathway activity) → Mining outcomes (bioleaching efficiency, acid mine drainage, bioremediation potential)

This is the same conceptual framework I used in my chromatin biology research where physical 3D chromosome organization constrains biological activity. The computational approaches are analogous. The scale is different.

---

## Data Sources

**Metagenomics:**
- SRA accession: SRR6189722
- BioProject: PRJNA414965
- Description: Gold mine tailings metagenome from Komsomolskaya gold mine, Kuzbass Russia
- Platform: 454 GS FLX Titanium, single-end reads
- Size: 438K reads, 444M bases, 1.1 GB FASTQ
- Published soil chemistry: pH 1-4, Fe 6088 mg/L, Cu 25 mg/L, As 800 mg/L, Zn 136 mg/L

**LiDAR:**
- Synthetic 50x50 meter grid at 1 meter resolution, 2500 rows
- Columns: x, y, elevation, slope, aspect, flow_direction (D8 encoded)
- Deliberate Gaussian drainage channel centered at x=25
- Spatially correlated with soil chemistry

**Soil Chemistry:**
- Synthetic 100 rows with realistic values based on published data
- Columns: x, y, pH, fe_mg_l, cu_mg_l, as_mg_l, zn_mg_l, moisture_pct, sulfate_mg_l
- Values spatially correlated with drainage channel: low pH and high metals near channel center

---

## Architecture

```
Bronze Layer:  Raw data ingestion with Pydantic validation
               - FASTQ adapter (metagenomics)
               - LiDAR grid adapter (point cloud)
               - Soil chemistry adapter (CSV)

Silver Layer:  Cleaned and normalized data
               - MetaPathways v3.5 pathway reconstruction
               - LiDAR topological feature extraction
               - Soil chemistry normalization and spatial indexing
               - CLR transformation for compositional metagenomics data

Gold Layer:    Integrated geospatial dataset
               - All three data streams merged on spatial coordinates
               - One unified record per grid cell
               - Parquet output with schema validation

Pipeline:      Nextflow DSL2 orchestrating all steps
               MetaPathways running in Docker container

Visualization: Streamlit plus D3 interactive dashboard
               - Geospatial heatmap of mine site
               - Toggle between microbial diversity, pathway activity,
                 soil chemistry overlays
               - Hover tooltip showing all three data streams per cell
               - Side panel with community composition for selected cell
               - Filter by pathway, taxon, or chemistry threshold
```

**Design principles:**
- Hexagonal ports and adapters: each data source has its own adapter, core pipeline logic is data-source agnostic
- Medallion architecture: bronze/silver/gold with clean layer separation
- Pydantic validation at every layer boundary, fail fast with clear errors
- Parquet outputs with schema validation for downstream reproducibility
- MetaPathways containerized in Docker for reproducible execution
- Nextflow DSL2 for pipeline orchestration with local and cloud profiles

---

## Current Progress

**Completed (Session 1):**
- Project initialized with uv, pyproject.toml created
- Dependencies installed: numpy, pandas, pydantic, Python 3.12+
- Folder structure established: data/bronze, data/silver, data/gold, scripts, src
- SRR6189722.fastq downloaded (1.1 GB real data)
- lidar_grid.csv generated (2500 rows synthetic)
- soil_chemistry.csv generated (100 rows synthetic)
- Steering file created: minescope-rules.md

**Next priority:**
- Find and pull MetaPathways v3.5 Docker image from Hallam Lab or Biocontainers
- Test MetaPathways on a subset of SRR6189722
- Write Nextflow DSL2 process wrapping MetaPathways container
- Then build Pydantic domain models for all three data types
- Then build bronze adapters
- Then silver layer transformations
- Then gold integration layer
- Then Streamlit plus D3 visualization

---

## Steering Rules (from minescope-rules.md)

- Do not over-engineer. Simplest solution always preferred.
- Break code into chunks of 20 to 30 lines maximum.
- Explain what each chunk does before showing it.
- Ask questions at every decision point where context matters.
- Present options with tradeoffs when multiple approaches exist.
- Never move to next component until current one is understood.
- Keep the biological narrative front and center in every decision.

---

## What I Need to Be Able to Say on May 19th

When Thea asks about the science: explain the physical to chemical to biological narrative, why Acidithiobacillus matters in acid mine drainage, what MetaPathways reveals about community metabolic potential, and how the three data streams together tell a story no single stream can tell alone.

When Erin asks about the platform: explain the medallion architecture, the hexagonal design that makes each data source pluggable, the Nextflow orchestration, and how this scales from a demo to a production platform serving mining clients.

When either asks why I built this: because Tomer described the problem in the interview and I went and built a solution. That is the kind of person I am.

---

## Additional Context: Why This Matters to Koonkie

MetaPathways was developed by the Hallam Lab, Steven Hallam's lab, which is Koonkie's scientific foundation. Understanding and using MetaPathways is not just technically relevant, it is culturally aligned with where Koonkie comes from scientifically.

The containerization of MetaPathways and its integration into a Nextflow pipeline that could be deployed on cloud infrastructure is potentially a direct contribution to Koonkie's production platform. If I build this well before the interview I am not just demonstrating skills, I am potentially delivering something they can actually use.

The $9 million Digital Supercluster funding means they are committed to building this at scale. Someone who shows up having already understood the architecture, used their core tool, and built a prototype of what they are trying to build is not just a strong candidate. They are already a team member in practice.

---

Use this context to maintain full project continuity across sessions. Always refer back to the biological narrative, the Koonkie interview context, and the steering rules when making any design decision.

---
