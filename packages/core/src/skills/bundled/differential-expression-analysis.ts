import { SkillDefinition } from '../../types/skills.js';

export const DifferentialExpressionAnalysisSkill: SkillDefinition = {
  id: 'differential-expression-analysis',
  name: 'differential-expression-analysis',
  displayName: 'Transcriptomic Differential Expression & Volcano Plot Analysis',
  description: 'Perform statistical two-group differential gene expression analysis, calculating Log2 Fold Change, Welch t-test p-values, Benjamini-Hochberg FDR correction, and Volcano plot thresholds.',
  category: 'bioinformatics',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['python_runner'],
  keywords: ['differential expression', 'transcriptomics', 'volcano', 'deg', 'rnaseq', 'fdr', 'log2fc', 'masld', 'nash'],
  workflowSteps: [
    '1. Ingest normalized expression matrices for Case and Control groups.',
    '2. Compute mean expression levels, variance, and log2 fold change (log2FC).',
    '3. Execute Welch t-test for unequal variances to derive raw p-values.',
    '4. Apply Benjamini-Hochberg procedure to calculate adjusted q-values (FDR).',
    '5. Extract top upregulated and downregulated hub genes and generate volcano plot coordinates.',
  ],
  instructions: `When presenting differential expression analysis:
- Provide summary metrics: Total genes tested, significant upregulated count (log2FC >= 1.0, FDR < 0.05), and significant downregulated count (log2FC <= -1.0, FDR < 0.05).
- List top 5-10 key biomarker genes with their exact log2FC, raw p-value, and FDR q-value in a Markdown table.
- Highlight biologically relevant disease pathways represented by the top DEGs.`,
  examples: [
    'Analyze hepatic transcriptomic signatures in MASLD (MASH) vs normal controls to identify fibrosis and lipogenesis drivers (PNPLA3, TM6SF2, COL1A1).',
    'Perform differential expression on PBMC RNA-seq from patients receiving targeted kinase inhibitor vs placebo.',
  ],
  helperScripts: {
    'deg_stats.py': `
import math

def compute_welch_t(group1, group2):
    n1, n2 = len(group1), len(group2)
    m1, m2 = sum(group1) / n1, sum(group2) / n2
    v1 = sum((x - m1)**2 for x in group1) / (n1 - 1) if n1 > 1 else 0.0
    v2 = sum((x - m2)**2 for x in group2) / (n2 - 1) if n2 > 1 else 0.0
    
    se = math.sqrt(v1/n1 + v2/n2)
    if se == 0:
        return 0.0, 1.0, m1 - m2
    t_stat = (m1 - m2) / se
    
    # Approximate p-value from t_stat
    p_val = max(1e-12, min(1.0, 2.0 * (1.0 - 0.5 * (1.0 + math.erf(abs(t_stat) / math.sqrt(2))))))
    log2fc = m1 - m2  # assuming input data is already log2 transformed
    return t_stat, p_val, log2fc
`,
  },
};
