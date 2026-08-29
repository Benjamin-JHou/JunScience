---
name: radiomics-feature-extraction
displayName: Medical Imaging Radiomics & Texture Feature Extraction
description: Extract quantitative radiomics descriptors from medical CT/MRI volumetric Regions of Interest (ROI), including first-order voxel intensity statistics, morphological shape sphericity, and Gray-Level Co-occurrence Matrix (GLCM) texture metrics.
category: imaging
version: 1.0.0
author: JunScience Core
requiredTools:
  - medical_imaging_process
  - python_runner
keywords:
  - radiomics
  - glcm
  - texture
  - ct
  - mri
  - hounsfield
  - imaging
  - steatosis
  - masld
---

# Medical Imaging Radiomics & Texture Feature Extraction

## Overview
Wraps `medical_imaging_process` into a standardized radiomics analysis SOP, extracting high-throughput quantitative imaging phenotypes across 3 core feature families:
1. **First-Order Intensity Statistics**: Mean, Median, Variance, Skewness, Kurtosis, and Energy within physical CT bounds ($HU \in [-1024, +3071]$).
2. **Morphological Shape Descriptors**: Volume ($\text{mm}^3$), Surface Area, Sphericity, and Surface-to-Volume ratio.
3. **Second-Order Texture Features**: Gray-Level Co-occurrence Matrix (GLCM) Contrast, Dissimilarity, Homogeneity, ASM, Energy, and Correlation.
