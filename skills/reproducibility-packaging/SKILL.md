---
name: reproducibility-packaging
displayName: Scientific Pipeline Reproducibility & Provenance Packaging
description: Package complete research pipelines into deterministic reproducibility bundles (manifest.json) containing executed script hashes, random seeds, input data SHA-256 digests, runtime environment snapshots, and parameter dictionaries.
category: reproducibility
version: 1.0.0
author: JunScience Core
requiredTools:
  - python_runner
keywords:
  - reproducibility
  - provenance
  - manifest
  - sha256
  - audit
  - integrity
  - open science
---

# Scientific Pipeline Reproducibility & Provenance Packaging

## Overview
Generates an audit-ready, cryptographically verifiable `reproducibility_manifest.json` ensuring full computational and scientific repeatability for every analysis pipeline:
- **Parameter Snapshot**: Complete dictionary of input hyper-parameters, thresholds, and filter bounds.
- **Data Provenance**: SHA-256 checksums of input datasets and output artifact files.
- **Random Seeds**: Explicit initialization seeds (e.g. `numpy.random.seed(42)`).
- **Runtime Environment**: Python version, OS kernel version, package dependencies.
