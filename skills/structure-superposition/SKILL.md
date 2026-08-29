---
name: structure-superposition
displayName: 3D Protein Structure Superposition & RMSD Calculation
description: Superimpose two PDB or AlphaFold 3D coordinate sets using Kabsch rotation algorithm, computing global C-alpha RMSD and per-residue displacement distances.
category: molecular-biology
version: 1.0.0
author: JunScience Core
requiredTools:
  - pdb_lookup
  - python_runner
keywords:
  - structure superposition
  - rmsd
  - kabsch
  - c-alpha
  - pdb
  - alphafold
  - conformational change
---

# 3D Protein Structure Superposition & RMSD Calculation

## Overview
Calculates the optimal rigid-body rotation and translation matrix using the Kabsch algorithm to superimpose two macromolecular 3D structures (e.g. apo vs holo ligand-bound conformations, or AlphaFold prediction vs experimental X-ray/cryo-EM crystal structures).

## Workflow Steps
1. Fetch 3D atomic coordinates (.pdb / .cif) using `pdb_lookup`.
2. Filter for matching C-alpha (CA) atoms across shared sequence alignment.
3. Compute centroid translation and Kabsch SVD optimal rotation matrix.
4. Calculate global RMSD ($\text{RMSD} = \sqrt{\frac{1}{N}\sum (x_i - y_i)^2}$) and per-residue displacement distances.
5. Identify regions with conformational shifts ($> 2.0\text{ \AA}$).
