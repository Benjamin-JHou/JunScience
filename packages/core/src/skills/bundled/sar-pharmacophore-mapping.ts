import { SkillDefinition } from '../../types/skills.js';

export const SarPharmacophoreMappingSkill: SkillDefinition = {
  id: 'sar-pharmacophore-mapping',
  name: 'sar-pharmacophore-mapping',
  displayName: 'SAR & Pharmacophore Mapping',
  description: 'Correlate chemical substituent modifications with target bioactivity (IC50, Ki, Kd) shifts across ChEMBL assays, evaluate Lipinski rule-of-5 compliance, and deduce essential pharmacophore motifs.',
  category: 'chemistry',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['chembl_lookup', 'pubchem_lookup', 'python_runner'],
  keywords: ['sar', 'pharmacophore', 'ic50', 'ki', 'lipinski', 'smiles', 'bioactivity', 'docking', 'scaffold'],
  workflowSteps: [
    '1. Query ChEMBL for target-specific bioactivity records and chemical series.',
    '2. Query PubChem PUG REST for 2D/3D Canonical SMILES and Lipinski descriptors (MW, LogP, HBD, HBA).',
    '3. Compare active vs inactive chemical analogues to isolate critical pharmacophoric features.',
    '4. Execute Python analysis script in sandbox to calculate ligand efficiency (LE) and lipophilic efficiency (LipE).',
    '5. Summarize key structure-activity takeaways and optimization vectors.',
  ],
  instructions: `When conducting SAR & pharmacophore analysis:
- Always compute Ligand Efficiency (LE = 1.37 * pIC50 / HeavyAtomCount) and Lipophilic Efficiency (LipE = pIC50 - cLogP).
- Identify hinge-binding fragments, hydrophobic subpocket fillers, and solubilizing solvent-exposed tails.
- Differentiate between orthosteric ATP-competitive scaffolds and allosteric regulatory domain binders.`,
  examples: [
    'Analyze SAR landscape of deuterated nicotinamide analogues targeting TYK2 JH2 pseudokinase domain.',
    'Map pharmacophore requirements for dual JAK1/TYK2 selective inhibitors vs pan-JAK inhibitors.',
  ],
};
