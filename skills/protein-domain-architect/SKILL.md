---
name: protein-domain-architect
displayName: Protein Domain Architecture & 3D Hotspot Mapping
description: Deconstruct multidomain protein topological architectures from Swiss-Prot UniProtKB, map active catalytic and allosteric pocket boundaries, and cross-reference AlphaFold pLDDT disorder scores.
category: proteomics
version: 1.0.0
author: JunScience Core
requiredTools:
  - uniprot_lookup
  - pdb_lookup
  - python_runner
keywords:
  - domain
  - topology
  - pseudokinase
  - kinase
  - plddt
  - alphafold
  - hotspot
  - uniprot
---

# Protein Domain Architecture & 3D Hotspot Mapping

## Overview
Deconstructs full-length protein sequences into functional modular domains (e.g. TYK2: FERM domain aa 1-380, SH2 domain aa 447-550, JH2 pseudokinase domain aa 589-875, JH1 catalytic kinase domain aa 900-1187).
