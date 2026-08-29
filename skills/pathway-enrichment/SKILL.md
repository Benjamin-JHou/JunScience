---
name: pathway-enrichment
displayName: Pathway Enrichment & Cascade Analysis
description: Map differential target genes onto biological pathways (KEGG, Reactome, GO) and execute hypergeometric overrepresentation statistical testing with Benjamini-Hochberg FDR correction.
category: pathways
version: 1.0.0
author: JunScience Core
requiredTools:
  - uniprot_lookup
  - python_runner
keywords:
  - pathway
  - kegg
  - reactome
  - enrichment
  - hypergeometric
  - fdr
  - go
  - cascade
---

# Pathway Enrichment & Cascade Analysis

## Overview
Maps candidate or differentially expressed genes against annotated pathway databases (Reactome, KEGG, GO) and performs overrepresentation testing via hypergeometric distribution ($p = \sum_{i=k}^n \frac{\binom{M}{i}\binom{N-M}{n-i}}{\binom{N}{n}}$) with Benjamini-Hochberg FDR q-value correction.
