import { SkillDefinition } from '../../types/skills.js';

export const ChemicalSimilaritySearchSkill: SkillDefinition = {
  id: 'chemical-similarity-search',
  name: 'chemical-similarity-search',
  displayName: 'Chemical Similarity & Fingerprint Tanimoto Search',
  description: 'Compute structural similarity across chemical compound libraries using circular fingerprints (Morgan / ECFP4) and Tanimoto coefficient matrices.',
  category: 'cheminformatics',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['pubchem_lookup', 'chembl_lookup', 'python_runner'],
  keywords: ['similarity', 'tanimoto', 'fingerprint', 'morgan', 'ecfp4', 'cheminformatics', 'scaffold', 'analogs'],
  workflowSteps: [
    '1. Collect query SMILES (e.g. Deucravacitinib) and comparator library SMILES (Tofacitinib, Baricitinib, Ruxolitinib, Upadacitinib).',
    '2. Generate binary circular fingerprint bit sets in Python sandbox.',
    '3. Calculate pairwise Tanimoto similarity coefficients (0.0 to 1.0).',
    '4. Cluster compounds into structural clusters or scaffold families.',
    '5. Report analogs with high similarity (T >= 0.70) or identify novel scaffold hopping candidates.',
  ],
  instructions: `When reporting chemical similarity:
- Present the similarity matrix clearly with molecule names and Tanimoto coefficients.
- Explain structural reasons for low or high similarity (e.g. core deuterated amide or heterocycle substitutions).
- Correlate structural divergence with selectivity shifts (e.g. allosteric vs orthosteric ATP-site binding).`,
  examples: [
    'Calculate Tanimoto similarity matrix comparing Deucravacitinib against first-generation pan-JAK inhibitors.',
    'Screen ChEMBL bioactive molecules for high-similarity analogs of a lead compound.',
  ],
  helperScripts: {
    'tanimoto_matrix.py': `
def compute_tanimoto(bitset_a: set, bitset_b: set) -> float:
    intersection = len(bitset_a.intersection(bitset_b))
    union = len(bitset_a.union(bitset_b))
    if union == 0:
        return 1.0 if len(bitset_a) == len(bitset_b) else 0.0
    return round(intersection / union, 4)
`,
  },
};
