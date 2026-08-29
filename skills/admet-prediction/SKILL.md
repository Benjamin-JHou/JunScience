---
name: admet-prediction
displayName: Small-Molecule ADMET & Druglikeness Profiling
description: Evaluate small-molecule physicochemical properties (MW, LogP, TPSA, HBD, HBA, RotB), Lipinski Rule of Five compliance, Veber oral bioavailability criteria, and quantitative drug-likeness (QED).
category: cheminformatics
version: 1.0.0
author: JunScience Core
requiredTools:
  - pubchem_lookup
  - chembl_lookup
  - python_runner
keywords:
  - admet
  - lipinski
  - rule of five
  - druglikeness
  - qed
  - tpsa
  - logp
  - bioavailability
---

# Small-Molecule ADMET & Druglikeness Profiling

## Overview
Computes fundamental physicochemical and ADMET (Absorption, Distribution, Metabolism, Excretion, Toxicity) filter criteria for drug candidate molecules from SMILES / 2D chemical structures.

## Evaluated Physicochemical Parameters
- **Molecular Weight (MW)**: $\le 500\text{ g/mol}$ (Lipinski Rule of 5)
- **Octanol-Water Partition ($\text{LogP}$)**: $\le 5.0$
- **Hydrogen Bond Donors (HBD)**: $\le 5$ (OH, NH groups)
- **Hydrogen Bond Acceptors (HBA)**: $\le 10$ (O, N atoms)
- **Topological Polar Surface Area (TPSA)**: $\le 140\text{ \AA}^2$ (Veber criterion for oral bioavailability)
- **Rotatable Bonds**: $\le 10$ (Veber flexibility criterion)
- **QED (Quantitative Estimate of Drug-likeness)**: $0.0 \sim 1.0$ (values $> 0.6$ denote attractive drug candidate space)
