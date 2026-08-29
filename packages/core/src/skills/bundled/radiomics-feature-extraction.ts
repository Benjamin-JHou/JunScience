import { SkillDefinition } from '../../types/skills.js';

export const RadiomicsFeatureExtractionSkill: SkillDefinition = {
  id: 'radiomics-feature-extraction',
  name: 'radiomics-feature-extraction',
  displayName: 'Medical Imaging Radiomics & Texture Feature Extraction',
  description: 'Extract quantitative radiomics descriptors from medical CT/MRI volumetric Regions of Interest (ROI), including first-order intensity statistics, morphological shape sphericity, and GLCM texture metrics.',
  category: 'imaging',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['medical_imaging_process', 'python_runner'],
  keywords: ['radiomics', 'texture', 'glcm', 'ct', 'mri', 'hounsfield', 'sphericity', 'homogeneity', 'imaging', 'masld'],
  workflowSteps: [
    '1. Ingest DICOM/NIfTI medical image series and segmentation mask (ROI).',
    '2. Enforce clinical privacy gate and execute feature extraction in kernel-isolated sandbox.',
    '3. Compute first-order intensity statistics (Mean HU, Std, Skewness, Kurtosis).',
    '4. Compute 3D morphological parameters (Volume, Sphericity, Surface-to-Volume ratio).',
    '5. Compute 2D/3D GLCM texture matrix features (Homogeneity, Contrast, Entropy).',
  ],
  instructions: `When reporting radiomics feature extractions:
- Verify that CT intensity statistics fall within valid calibration bounds (-1024 to +3071 HU).
- Present extracted features grouped into First-Order, Shape, and GLCM Texture tables.
- Interpret imaging biomarkers in clinical context (e.g. liver-to-spleen HU attenuation ratio for hepatic steatosis in MASLD).`,
  examples: [
    'Extract hepatic parenchymal radiomics features from non-contrast abdominal CT scans in suspected MASLD.',
    'Quantify pulmonary lesion texture and sphericity on chest CT scans.',
  ],
  helperScripts: {
    'radiomics_calc.py': `
import numpy as np

def compute_first_order_stats(voxels: np.ndarray) -> dict:
    valid_voxels = voxels.flatten()
    return {
        "mean_hu": round(float(np.mean(valid_voxels)), 2),
        "std_hu": round(float(np.std(valid_voxels)), 2),
        "min_hu": round(float(np.min(valid_voxels)), 2),
        "max_hu": round(float(np.max(valid_voxels)), 2),
        "median_hu": round(float(np.median(valid_voxels)), 2),
        "voxel_count": len(valid_voxels)
    }
`,
  },
};
