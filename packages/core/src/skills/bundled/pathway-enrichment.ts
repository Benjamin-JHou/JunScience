import { SkillDefinition } from '../../types/skills.js';

export const PathwayEnrichmentSkill: SkillDefinition = {
  id: 'pathway-enrichment',
  name: 'pathway-enrichment',
  displayName: 'Pathway Enrichment & Cascade Analysis',
  description: 'Map differential target genes onto biological pathways (KEGG, Reactome, GO) and execute hypergeometric overrepresentation statistical testing with Benjamini-Hochberg FDR correction.',
  category: 'pathways',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['uniprot_lookup', 'python_runner'],
  keywords: ['pathway', 'kegg', 'reactome', 'enrichment', 'hypergeometric', 'fdr', 'go', 'cascade'],
  workflowSteps: [
    '1. Collect candidate gene symbols from literature or transcriptomic probes.',
    '2. Query UniProt to verify canonical gene symbols and functional annotations.',
    '3. Construct background gene universe (e.g. N=20,000 human protein-coding genes).',
    '4. Execute Python hypergeometric test (scipy.stats.hypergeom) in sandbox to calculate raw p-values.',
    '5. Apply Benjamini-Hochberg multiple hypothesis correction and output significant pathways (FDR < 0.05).',
  ],
  instructions: `When conducting pathway enrichment analysis:
- Always report both raw p-value and FDR-adjusted q-value.
- Detail the overlap count (k/K) and pathway background size (M/N).
- Highlight key signaling nodes (e.g. JAK-STAT, PI3K-Akt, NF-kB) and downstream effector genes.`,
  examples: [
    'Perform pathway enrichment on candidate autoimmune genes: STAT4, TYK2, IRF5, IFI44L.',
    'Analyze signaling cascade downstream of TYK2 inhibition in systemic lupus erythematosus.',
  ],
  helperScripts: {
    'enrichment_calc.py': `
import math
import json

def hypergeom_pmf(k, M, n, N):
    # k: overlap, M: total genes, n: pathway size, N: query size
    from scipy.stats import hypergeom
    return float(hypergeom.sf(k - 1, M, n, N))

def benjamini_hochberg(p_values):
    n = len(p_values)
    sorted_pairs = sorted(enumerate(p_values), key=lambda x: x[1])
    adjusted = [0.0] * n
    cum_min = 1.0
    for rank, (orig_idx, p) in reversed(list(enumerate(sorted_pairs, start=1))):
        fdr = min(cum_min, p * n / rank)
        cum_min = fdr
        adjusted[orig_idx] = fdr
    return adjusted
`,
  },
};
