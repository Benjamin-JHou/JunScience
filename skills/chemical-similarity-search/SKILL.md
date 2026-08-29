---
name: chemical-similarity-search
displayName: Chemical Similarity & Fingerprint Tanimoto Search
description: Compute structural similarity across chemical compound libraries using circular fingerprints (Morgan / ECFP4) and Tanimoto coefficient matrices.
category: cheminformatics
version: 1.0.0
author: JunScience Core
requiredTools:
  - pubchem_lookup
  - chembl_lookup
  - python_runner
keywords:
  - chemical similarity
  - tanimoto
  - morgan fingerprint
  - ecfp4
  - scaffold
  - bioisostere
  - chembl
---

# Chemical Similarity & Fingerprint Tanimoto Search

## Overview
Evaluates pairwise or library-wide structural similarity across small-molecule drug candidates using circular Morgan / ECFP4 topological fingerprints and Tanimoto similarity coefficients:

$$T(A, B) = \frac{|A \cap B|}{|A \cup B|} = \frac{c}{a + b - c}$$

## Workflow Steps
1. Parse query compound SMILES and candidate chemical structures.
2. Generate circular topological binary bit vectors (e.g. 2048-bit ECFP4).
3. Compute Tanimoto similarity metrics ($T \in [0.0, 1.0]$).
4. Identify scaffold hops, bioisosteric modifications, and analogs ($T \ge 0.70$).
5. Rank and summarize top similar chemical entities and their bioactivity profiles.
