---
name: systematic-review-prisma
displayName: PRISMA 2020 Systematic Review Workflow & Flowchart Generator
description: Track literature search counts, deduplication, screening exclusions with structured reasons, and generate standard PRISMA 2020 four-phase flowchart data.
category: literature
version: 1.0.0
author: JunScience Core
requiredTools:
  - literature_search
  - clinical_trials_lookup
  - python_runner
keywords:
  - prisma
  - systematic review
  - meta-analysis
  - screening
  - flow diagram
  - deduplication
  - literature
---

# PRISMA 2020 Systematic Review Workflow & Flowchart Generator

## Overview
Implements the 4-phase PRISMA 2020 (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) workflow:
1. **Identification**: Records identified from PubMed, Europe PMC, arXiv/bioRxiv, ClinicalTrials.gov, and registries.
2. **Deduplication**: Automated exact DOI / title duplicate filtering.
3. **Screening**: Title and abstract screening with recorded reason counts.
4. **Included**: Full-text assessed for eligibility and final studies included in quantitative/qualitative synthesis.
