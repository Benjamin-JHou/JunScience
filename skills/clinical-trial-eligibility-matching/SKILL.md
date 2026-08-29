---
name: clinical-trial-eligibility-matching
displayName: Patient Cohort & Clinical Trial Eligibility Matching
description: Parse unstructured patient clinical profiles and match against ClinicalTrials.gov Protocol Section inclusion/exclusion criteria (e.g. age, stage, prior lines of therapy, laboratory cutoffs).
category: clinical
version: 1.0.0
author: JunScience Core
requiredTools:
  - clinical_trials_lookup
  - python_runner
keywords:
  - eligibility
  - clinical trial
  - patient matching
  - inclusion criteria
  - exclusion criteria
  - recruitment
  - nct
  - masld
---

# Patient Cohort & Clinical Trial Eligibility Matching

## Overview
Evaluates multi-parametric patient clinical attributes (e.g. Age, Diagnosis, Disease Severity / Fibrosis stage, Prior systemic treatments, Organ function cutoffs) against structured and unstructured inclusion/exclusion criteria of registered clinical trials from ClinicalTrials.gov API v2.

## Workflow Steps
1. Ingest patient profile structured attributes (e.g. 54 y/o female with biopsy-proven MASH stage F2 fibrosis, eGFR > 60 mL/min).
2. Retrieve active recruiting clinical trials for target condition from `clinical_trials_lookup`.
3. Extract eligibility criteria blocks (MinAge, MaxAge, Gender, Inclusion/Exclusion text).
4. Evaluate compliance across key criterion dimensions:
   - Age / Gender criteria
   - Disease staging & confirmation modality (biopsy, MRE, CAP)
   - Prior therapeutic restrictions (e.g. no prior GLP-1 within 3 months)
   - Laboratory safety exclusions (e.g. ALT > 5x ULN, platelets < 100k)
5. Generate patient-trial compatibility verdict (`Eligible`, `Ineligible`, `Requires Clarification`).
