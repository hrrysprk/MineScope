# Geochemically-Constrained Functional Annotation for Extreme Environment Metagenomics
**Harpreet Singh · MDS Candidate, UBC · May 2026**

---

## The Problem

Mining metagenomes are among the most functionally novel environments in microbiology. Up to 80% of organisms at an acid mine drainage site have no close relative in any reference database. When MetaPathways runs BLAST against SwissProt, it searches a database built from well-studied laboratory organisms — E. coli, human pathogens, agricultural microbes. The AMD community falls outside that reference space. Annotations come back sparse. Pathway reconstruction fails. The biology stays opaque.

This is not a sequencing problem. The data is there. It is a reference problem — and throwing more BLAST at it does not solve it.

---

## The Insight

The environment itself is a constraint on the biology. At pH 1.5 with iron at 6,000 mg/L and sulfate dominating the anion pool, the vast majority of metabolic strategies are thermodynamically impossible. Only a narrow set of pathways can operate. Only proteins with specific biophysical signatures — excess surface charge, proton exclusion motifs, metal-coordinating residues — can remain stable. And because most biogeochemical cycles require multiple species to complete, detecting half a pathway tells you exactly what the other half must look like.

The environment does not just host the biology. It predicts it.

---

## The Approach: Four Independent Constraints

Rather than a single BLAST score, candidate annotations are evaluated against four mechanistically independent lines of evidence. The answer lives in the intersection.

**Constraint 1 — Sequence space**
What proteins are encoded in this sample? Standard assembly and ORF prediction from FASTQ/FASTA. This is the full candidate pool.

**Constraint 2 — Geochemical feasibility**
What proteins can physically function at this chemistry? pH, temperature, and ion concentrations define which catalytic strategies are thermodynamically viable and which protein structural features are required for stability. Candidates incompatible with the measured chemistry are eliminated regardless of their sequence similarity score.

**Constraint 3 — Pathway completeness**
What proteins are required to close the detected pathway fragments? Most biogeochemical cycles are distributed across multiple species. Detecting steps 1, 2, and 4 of a six-step pathway constrains what steps 3, 5, and 6 must look like — functionally and structurally — even if they have no annotated homolog.

**Constraint 4 — Metabolomics validation**
What pathway products are actually present in the soil? Targeted LC-MS/MS for sulfur intermediates (thiosulfate, tetrathionate, sulfate), organic acids, and siderophores provides direct observational confirmation of pathway activity independent of any sequence or structural inference. In acidic AMD environments, sulfur cycle intermediates are unusually stable — the chemistry that would degrade them at neutral pH is inhibited. This makes metabolomics particularly powerful in exactly the environments where reference databases are weakest.

---

## The Stress Gradient as a Confidence Weight

Environmental stress gradients are information, not noise. In AMD zones — low pH, high metals, low ORF count — strong selective pressure means every gene present is functionally essential for survival at that chemistry. The organisms that cannot perform AMD metabolism are dead. What survives is the distilled functional core of AMD metabolism. Unannotated proteins in high-stress cells are the highest-priority annotation targets because the probability that they perform AMD-relevant functions approaches certainty.

In moderate-stress zones, taxonomic diversity increases and AMD-specific functions become proportionally rarer — diluted across a larger, more generalist community. The signal is there but noisier. In near-neutral zones, ORF counts are highest but AMD-relevant functions are a small fraction of the functional pool.

This inverts the intuition. The AMD zone looks data-poor by conventional richness metrics. It is actually the highest signal-to-noise environment in the dataset.

```
AMD core (pH 1.5, low ORF count)
  → Geochemical constraint dominates
  → Near-certain AMD relevance
  → Unannotated proteins = highest priority ESM2 targets

Transition zone (pH 2-4)
  → Pathway completeness constraint dominates
  → Metabolomics needed to separate AMD from generalist functions

Flank zones (pH 4+, high ORF count)
  → Diversity dilutes AMD signal
  → Useful as contrast reference — what is NOT AMD-specific
```

The spatial gradient across the mine site becomes a confidence weight on the annotation pipeline. The system knows where to look first. This gradient is directly observable in the MineScope gold layer — functional richness plotted against pH across grid cells shows the inverse relationship computed from real AMD sequencing data.

---

## Where Foundation Models Fit

ESM2 and structural alignment tools (Foldseek + AlphaFold2 predicted structures) run inside the constrained space — not as a first-pass search across all possible functions, but as a precision tool on the residual unknowns that survive all four filters. By the time ESM2 runs, the hypothesis space has been reduced from tens of thousands of possible annotations to a small, biologically coherent candidate set. Sensitivity and specificity both improve.

---

## Connection to M-MAP

Every sample processed through this pipeline generates annotations with four independent lines of supporting evidence rather than a single BLAST score. Those annotations are ground truth training labels, not predictions. As M-MAP grows, the reference space for constraints 1 and 3 becomes denser in exactly the environmental regime mining companies care about. The system compounds — each new site improves annotation quality for every subsequent site.

This is the scientific moat. A database built from mining environments, annotated with geochemical and metabolomic context, trained on confirmed pathway activity rather than sequence identity thresholds, cannot be replicated by downloading SwissProt.

---

## What This Enables

The immediate output is higher-confidence functional annotation for novel AMD organisms. The medium-term output is a pathway completion map across the mine site — which biogeochemical cycles are running, where, and how completely. The long-term output is predictive: given terrain topology and soil chemistry at a new site, predict the microbial functional profile before sequencing. That is the transition from descriptive microbiology to actionable site management.

---

*Built on MineScope — a working prototype integrating metagenomics, LiDAR terrain, and soil chemistry for the Komsomolskaya gold mine tailings dataset (SRR6189722). Live at hrrysprk.github.io/MineScope*
