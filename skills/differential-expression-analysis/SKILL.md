---
name: differential-expression-analysis
displayName: Transcriptomic Differential Expression & Volcano Plot Analysis
description: Perform statistical two-group differential gene expression analysis, calculating Log2 Fold Change, Welch t-test / Wilcoxon p-values, Benjamini-Hochberg FDR correction, and Volcano plot thresholds.
category: bioinformatics
version: 1.0.0
author: JunScience Core
requiredTools:
  - python_runner
keywords:
  - differential expression
  - rnaseq
  - transcriptomics
  - volcano plot
  - fold change
  - fdr
  - t-test
  - masld
---

# Transcriptomic Differential Expression & Volcano Plot Analysis

## Overview
Identifies significantly upregulated and downregulated genes between disease and control conditions (e.g. MASLD / MASH liver biopsies vs healthy liver, or treatment vs placebo cohorts).

## Workflow Steps
1. Load expression count or normalized TPM/FPKM matrix (Genes $\times$ Samples).
2. Compute $\log_2(\text{Fold Change}) = \bar{X}_{\text{treatment}} - \bar{X}_{\text{control}}$.
3. Execute Welch's two-sample t-test or Wilcoxon rank-sum test for each gene.
4. Perform Benjamini-Hochberg False Discovery Rate (FDR) multiple testing correction.
5. Classify genes by significance criteria:
   - **Significantly Upregulated**: $\log_2\text{FC} \ge 1.0$ and $\text{FDR} < 0.05$
   - **Significantly Downregulated**: $\log_2\text{FC} \le -1.0$ and $\text{FDR} < 0.05$
   - **Not Significant**: $|\log_2\text{FC}| < 1.0$ or $\text{FDR} \ge 0.05$
