---
name: adverse-event-signal-detection
displayName: Pharmacovigilance Disproportionality & FAERS Signal Detection
description: Quantify adverse event reporting disproportionality from spontaneous reporting databases (openFDA FAERS) using Reporting Odds Ratio (ROR), Proportional Reporting Ratio (PRR), and 95% confidence intervals.
category: clinical
version: 1.0.0
author: JunScience Core
requiredTools:
  - openfda_lookup
  - python_runner
keywords:
  - adverse event
  - faers
  - ror
  - prr
  - pharmacovigilance
  - signal detection
  - safety
  - openfda
---

# Pharmacovigilance Disproportionality & FAERS Signal Detection

## Overview
Evaluates post-marketing safety signals using $2 \times 2$ contingency tables across FDA Adverse Event Reporting System (FAERS) case records:

| | Target Adverse Event ($E$) | Other Adverse Events ($\neg E$) | Total |
| :--- | :---: | :---: | :---: |
| **Target Drug ($D$)** | $a$ | $b$ | $a + b$ |
| **All Other Drugs ($\neg D$)** | $c$ | $d$ | $c + d$ |

## Signal Criteria
- **Reporting Odds Ratio (ROR)**: $\text{ROR} = \frac{a \cdot d}{b \cdot c}$ with $95\%\text{ CI} = \exp\left(\ln(\text{ROR}) \pm 1.96 \sqrt{\frac{1}{a} + \frac{1}{b} + \frac{1}{c} + \frac{1}{d}}\right)$
- **Positive Signal Definition**: $a \ge 3$ and $\text{ROR}_{025} > 1.0$ (lower bound of 95% CI exceeds unity).
