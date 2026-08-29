---
name: survival-analysis
displayName: Kaplan-Meier Survival Analysis & Log-Rank Testing
description: Compute non-parametric Kaplan-Meier survival curves, Greenwood standard errors, median survival times, and Log-Rank comparative statistics across clinical trial cohorts.
category: statistics
version: 1.0.0
author: JunScience Core
requiredTools:
  - python_runner
keywords:
  - survival analysis
  - kaplan meier
  - log rank
  - hazard ratio
  - median survival
  - censoring
  - time to event
---

# Kaplan-Meier Survival Analysis & Log-Rank Testing

## Overview
Computes non-parametric time-to-event estimates ($S(t) = \prod_{t_i \le t} (1 - d_i / n_i)$) accounting for right-censoring, Greenwood variance intervals, and two-group Log-Rank hypothesis testing ($\chi^2 = \frac{(O_1 - E_1)^2}{V}$).

## Workflow Steps
1. Ingest time-to-event ($T$), event status ($E \in \{0, 1\}$), and treatment arm assignment.
2. Order distinct event times and calculate number at risk ($n_i$) and events ($d_i$).
3. Compute cumulative survival probability $S(t)$ and 95% confidence intervals.
4. Determine median progression-free (PFS) or overall survival (OS) time.
5. Execute Log-Rank test to compare survival curves between arms.
