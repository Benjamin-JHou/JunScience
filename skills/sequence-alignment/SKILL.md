---
name: sequence-alignment
displayName: Multiple Sequence Alignment & Conservation Mapping
description: Align homologous protein/nucleotide sequences, calculate position-specific conservation scores, and annotate key functional motifs or drug-binding residues.
category: molecular-biology
version: 1.0.0
author: JunScience Core
requiredTools:
  - uniprot_lookup
  - python_runner
keywords:
  - sequence alignment
  - msa
  - blast
  - clustal
  - conservation
  - blosum62
  - similarity
---

# Sequence Alignment & Conservation Mapping

## Overview
This skill performs global/local sequence alignments on homologous target sequences (e.g. comparing kinase family paralogs such as TYK2, JAK1, JAK2, JAK3), calculates residue-level identity and BLOSUM62 similarity scores, and pinpoints variant positions across critical functional domains.

## Workflow Steps
1. Retrieve canonical FASTA sequences using `uniprot_lookup` or user FASTA input.
2. Extract specific domain boundaries (e.g. JH2 pseudokinase domain).
3. Execute alignment script via `python_runner` using standard scoring matrices (BLOSUM62, affine gap penalties).
4. Identify invariant residues, conservative substitutions, and divergent pocket positions.
5. Export alignment report and structured identity matrix.

## Helper Script: `align_sequences.py`
```python
def align_pairwise(seq1, seq2, match=2, mismatch=-1, gap_open=-3, gap_extend=-1):
    # Dynamic programming Needleman-Wunsch global alignment
    m, n = len(seq1), len(seq2)
    score = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        score[i][0] = i * gap_open
    for j in range(n + 1):
        score[0][j] = j * gap_open
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            diag = score[i - 1][j - 1] + (match if seq1[i - 1] == seq2[j - 1] else mismatch)
            delete = score[i - 1][j] + gap_open
            insert = score[i][j - 1] + gap_open
            score[i][j] = max(diag, delete, insert)
    return score[m][n]
```
