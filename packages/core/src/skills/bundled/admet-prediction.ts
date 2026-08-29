import { SkillDefinition } from '../../types/skills.js';

export const AdmetPredictionSkill: SkillDefinition = {
  id: 'admet-prediction',
  name: 'admet-prediction',
  displayName: 'Small-Molecule ADMET & Druglikeness Profiling',
  description: 'Evaluate small-molecule physicochemical properties (MW, LogP, TPSA, HBD, HBA, RotB), Lipinski Rule of Five compliance, Veber oral bioavailability criteria, and quantitative drug-likeness (QED).',
  category: 'cheminformatics',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['pubchem_lookup', 'chembl_lookup', 'python_runner'],
  keywords: ['admet', 'lipinski', 'qed', 'druglikeness', 'tpsa', 'logp', 'veber', 'bioavailability', 'smiles'],
  workflowSteps: [
    '1. Resolve compound SMILES or chemical identifier from PubChem or ChEMBL.',
    '2. Compute molecular weight, clogP, topological polar surface area (TPSA), HBD, HBA, and rotatable bonds.',
    '3. Score Lipinski Rule of 5 violations (MW <= 500, LogP <= 5, HBD <= 5, HBA <= 10).',
    '4. Score Veber oral bioavailability compliance (TPSA <= 140 Å², RotB <= 10).',
    '5. Compute multi-parameter QED score and synthesize ADMET optimization recommendations.',
  ],
  instructions: `When profiling small-molecule ADMET:
- Always present the quantitative values for MW, LogP, TPSA, HBD, HBA, and Rotatable Bonds in a clean Markdown table.
- State the exact number of Lipinski Rule of Five violations (0 = excellent oral candidate).
- Discuss potential permeability or clearance liabilities if TPSA or LogP exceed standard guidelines.`,
  examples: [
    'Assess druglikeness and Lipinski properties for Deucravacitinib (SMILES: CC1=NN(C(=O)C1)C2=NC=C(C=C2)C(=O)NC3=CC=CC(=C3)Cl).',
    'Compare ADMET parameters between first-generation pan-JAK inhibitors and second-generation allosteric TYK2 inhibitors.',
  ],
  helperScripts: {
    'admet_calc.py': `
def evaluate_druglikeness(mw: float, logp: float, hbd: int, hba: int, tpsa: float, rotb: int) -> dict:
    lipinski_violations = 0
    if mw > 500.0: lipinski_violations += 1
    if logp > 5.0: lipinski_violations += 1
    if hbd > 5: lipinski_violations += 1
    if hba > 10: lipinski_violations += 1
    
    veber_pass = (tpsa <= 140.0) and (rotb <= 10)
    
    # QED proxy formulation
    qed_score = round(max(0.1, min(0.95, 1.0 - (lipinski_violations * 0.15) - (max(0.0, tpsa - 140) * 0.002))), 2)
    
    return {
        "molecular_weight": mw,
        "logP": logp,
        "hbd": hbd,
        "hba": hba,
        "tpsa": tpsa,
        "rotatable_bonds": rotb,
        "lipinski_violations": lipinski_violations,
        "lipinski_compliant": lipinski_violations <= 1,
        "veber_oral_compliant": veber_pass,
        "qed_score": qed_score
    }
`,
  },
};
