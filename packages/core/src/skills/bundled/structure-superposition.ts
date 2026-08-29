import { SkillDefinition } from '../../types/skills.js';

export const StructureSuperpositionSkill: SkillDefinition = {
  id: 'structure-superposition',
  name: 'structure-superposition',
  displayName: '3D Protein Structure Superposition & RMSD Calculation',
  description: 'Superimpose two PDB or AlphaFold 3D coordinate sets using Kabsch rotation algorithm, computing global C-alpha RMSD and per-residue displacement distances.',
  category: 'molecular-biology',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['pdb_lookup', 'python_runner'],
  keywords: ['superposition', 'rmsd', 'structure', 'pdb', 'alphafold', 'kabsch', 'c-alpha', 'conformation'],
  workflowSteps: [
    '1. Retrieve coordinate files (PDB or AlphaFold mmCIF) for target and reference structures.',
    '2. Parse backbone C-alpha (CA) atom coordinates (x, y, z).',
    '3. Center both coordinate sets at coordinate origins.',
    '4. Compute Kabsch optimal rotation matrix via Singular Value Decomposition (SVD).',
    '5. Report global RMSD (Ångströms) and localize flexible loops vs rigid catalytic cores.',
  ],
  instructions: `When reporting structural superposition:
- Always state the total number of aligned C-alpha atom pairs ($N$).
- Report global RMSD in Å (values < 1.5 Å denote high structural fidelity).
- Highlight specific domain or pocket loops that undergo conformational shifts upon ligand binding.`,
  examples: [
    'Superimpose TYK2 JH2 apo structure vs Deucravacitinib-bound complex (PDB: 8Q4O) and calculate binding pocket RMSD.',
    'Compare AlphaFold predicted structure of mutant vs wild-type protein.',
  ],
  helperScripts: {
    'kabsch_rmsd.py': `
import numpy as np

def compute_kabsch_rmsd(P: np.ndarray, Q: np.ndarray) -> dict:
    # P, Q: (N, 3) coordinate matrices of matching CA atoms
    assert P.shape == Q.shape
    N = P.shape[0]
    
    # Center coordinates
    p_center = P - np.mean(P, axis=0)
    q_center = Q - np.mean(Q, axis=0)
    
    # Covariance matrix
    H = np.dot(p_center.T, q_center)
    U, S, Vt = np.linalg.svd(H)
    R = np.dot(Vt.T, U.T)
    
    # Special reflection case
    if np.linalg.det(R) < 0:
        Vt[2, :] *= -1
        R = np.dot(Vt.T, U.T)
        
    P_rotated = np.dot(p_center, R)
    diff = P_rotated - q_center
    rmsd = np.sqrt(np.sum(diff ** 2) / N)
    
    return {
        "aligned_atoms": N,
        "rmsd_angstrom": round(float(rmsd), 3),
        "mean_displacement": round(float(np.mean(np.linalg.norm(diff, axis=1))), 3)
    }
`,
  },
};
