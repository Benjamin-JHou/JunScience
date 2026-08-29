import { SkillDefinition } from '../../types/skills.js';

export const SequenceAlignmentSkill: SkillDefinition = {
  id: 'sequence-alignment',
  name: 'sequence-alignment',
  displayName: 'Multiple Sequence Alignment & Conservation Mapping',
  description: 'Align homologous protein or nucleotide sequences, calculate position-specific identity scores, and map conserved functional motifs or drug-binding residues.',
  category: 'molecular-biology',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['uniprot_lookup', 'python_runner'],
  keywords: ['alignment', 'sequence', 'msa', 'conservation', 'homology', 'paralog', 'identity', 'blosum62'],
  workflowSteps: [
    '1. Query UniProt for target protein accessions (e.g. TYK2 P29597 vs JAK1 P23458 vs JAK2 O60674).',
    '2. Define domain coordinates (e.g. JH2 pseudokinase domain ~aa 589-875).',
    '3. Execute alignment in Python sandbox with BLOSUM62 matrix and affine gap penalties.',
    '4. Compute pairwise sequence identity and similarity percentages.',
    '5. Highlight pocket-lining residues that confer allosteric drug selectivity.',
  ],
  instructions: `When performing sequence alignments:
- State both pairwise identity percentage and BLOSUM similarity score.
- Clearly annotate gaps and conserved catalytic or allosteric motifs (e.g. VAIK, HRD, DFG motifs in kinases).
- Report whether key selectivity residues are conserved or mutated.`,
  examples: [
    'Align TYK2 JH2 domain (P29597) against JAK1 JH2 (P23458) and JAK2 JH2 (O60674) to evaluate Deucravacitinib pocket conservation.',
    'Calculate pairwise identity between human and murine target orthologs.',
  ],
  helperScripts: {
    'align_sequences.py': `
def compute_pairwise_identity(seq1: str, seq2: str) -> dict:
    min_len = min(len(seq1), len(seq2))
    max_len = max(len(seq1), len(seq2))
    if max_len == 0:
        return {"identity": 0.0, "matches": 0, "length": 0}
    matches = sum(1 for a, b in zip(seq1[:min_len], seq2[:min_len]) if a == b)
    identity_pct = (matches / max_len) * 100.0
    return {
        "identity_percentage": round(identity_pct, 2),
        "matches": matches,
        "aligned_length": max_len
    }
`,
  },
};
