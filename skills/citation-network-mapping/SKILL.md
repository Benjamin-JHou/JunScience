---
name: citation-network-mapping
displayName: Citation Network Graph & Scientific Hub Analysis
description: Construct directed citation/co-citation graphs from bibliographic literature data, calculating in-degree centrality, PageRank, and identifying seminal scientific hub publications.
category: literature
version: 1.0.0
author: JunScience Core
requiredTools:
  - literature_search
  - python_runner
keywords:
  - citation network
  - graph
  - pagerank
  - centrality
  - bibliometrics
  - hub papers
  - literature
---

# Citation Network Graph & Scientific Hub Analysis

## Overview
Builds directed citation network graphs $G = (V, E)$ where nodes represent scientific publications (PMID / DOI) and edges represent citation links, computing degree centrality and identifying foundational vs emerging research clusters.

## Workflow Steps
1. Ingest seed papers and their bibliographic reference lists.
2. Build adjacency matrix and directed edge list.
3. Compute in-degree citation frequencies, out-degree reference counts, and hub centrality.
4. Cluster papers by subtopic or methodological focus.
5. Rank and highlight the top 5 most influential landmark papers in the domain.
