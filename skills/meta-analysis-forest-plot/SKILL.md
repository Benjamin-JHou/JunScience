---
name: meta-analysis-forest-plot
displayName: Meta-Analysis & Forest Plot Synthesis
description: Aggregate effect sizes across multi-center clinical trials using Inverse-Variance fixed-effects and DerSimonian-Laird random-effects models, evaluating Cochran Q and I² heterogeneity.
category: statistics
version: 1.0.0
author: JunScience Core
requiredTools:
  - clinical_trials_lookup
  - python_runner
keywords:
  - meta-analysis
  - forest plot
  - pooled effect
  - heterogeneity
  - i2
  - random effects
  - odds ratio
  - risk ratio
---

# Meta-Analysis & Forest Plot Synthesis

## Overview
Synthesizes binary (Risk Ratio, Odds Ratio) or continuous (Standardized Mean Difference) efficacy and safety endpoints across independent clinical studies.

## Mathematical Formulation
- **Study Weight ($w_i$)**: $w_i = \frac{1}{SE_i^2}$ (Fixed) or $w_i^* = \frac{1}{SE_i^2 + \tau^2}$ (Random)
- **Pooled Effect ($\theta$)**: $\theta = \frac{\sum w_i \theta_i}{\sum w_i}$
- **Heterogeneity ($I^2$)**: $I^2 = \max\left(0, \frac{Q - (k - 1)}{Q}\right) \times 100\%$ where $Q = \sum w_i (\theta_i - \theta)^2$
- **Interpretation**: $I^2 < 25\%$ (Low), $25-50\%$ (Moderate), $> 50\%$ (Substantial heterogeneity).
