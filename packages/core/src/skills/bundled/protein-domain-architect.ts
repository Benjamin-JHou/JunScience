import { SkillDefinition } from '../../types/skills.js';

export const ProteinDomainArchitectSkill: SkillDefinition = {
  id: 'protein-domain-architect',
  name: 'protein-domain-architect',
  displayName: 'Protein Domain Architecture & 3D Hotspot Mapping',
  description: 'Deconstruct multidomain protein topological architectures from Swiss-Prot UniProtKB, map active catalytic and regulatory sites, and align them against experimental RCSB PDB crystal structures and AlphaFold 3D coordinates.',
  category: 'proteomics',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['uniprot_lookup', 'pdb_lookup'],
  keywords: ['domain', 'kinase', 'structure', 'pdb', 'alphafold', 'active site', 'topology', 'pocket'],
  workflowSteps: [
    '1. Query UniProtKB to retrieve canonical sequence length, domain boundaries (FERM, SH2, Kinase, Pseudokinase), and active site residues.',
    '2. Query RCSB PDB via Search API v2 for high-resolution experimental crystal/cryo-EM structures.',
    '3. Retrieve AlphaFold DB deep learning 3D model for full-length structural context and disordered loop assessment (pLDDT).',
    '4. Cross-reference ligand-bound pockets with known disease mutation hotspots.',
    '5. Synthesize domain topology diagram and structural druggability appraisal.',
  ],
  instructions: `When mapping protein domain architecture:
- Explicitly delineate amino acid coordinate boundaries for each structural domain (e.g. JH1: 887-1187 aa, JH2: 590-870 aa).
- Highlight catalytic triad residues (e.g. Lys, Glu, Asp) and regulatory phosphorylation loops.
- Correlate domain-specific allosteric sites with structural selectivity mechanisms.`,
  examples: [
    'Map TYK2 multidomain architecture (FERM, SH2, JH2, JH1) and compare ATP-site conformation between JH1 and JH2 in PDB:6NZP.',
    'Examine APOE domain structure (N-terminal receptor binding vs C-terminal lipid binding) and Arg112/Arg158 isoform sites.',
  ],
};
