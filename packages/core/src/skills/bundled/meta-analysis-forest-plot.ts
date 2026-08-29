import { SkillDefinition } from '../../types/skills.js';

export const MetaAnalysisForestPlotSkill: SkillDefinition = {
  id: 'meta-analysis-forest-plot',
  name: 'meta-analysis-forest-plot',
  displayName: 'Meta-Analysis & Forest Plot Synthesis',
  description: 'Aggregate effect sizes across multi-center clinical trials using Inverse-Variance fixed-effects and DerSimonian-Laird random-effects models, evaluating Cochran Q and I² heterogeneity.',
  category: 'statistics',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['clinical_trials_lookup', 'python_runner'],
  keywords: ['meta-analysis', 'forest plot', 'random effects', 'fixed effects', 'heterogeneity', 'cochran q', 'i2', 'odds ratio'],
  workflowSteps: [
    '1. Extract trial effect estimates (log OR/RR) and standard errors across clinical trials.',
    '2. Compute inverse-variance study weights (Fixed and DerSimonian-Laird Random Effects).',
    '3. Calculate Cochran Q statistic and I² percentage of variation attributable to heterogeneity.',
    '4. Compute pooled summary effect size and 95% confidence intervals.',
    '5. Structure tabular forest plot coordinates with individual study weights and confidence intervals.',
  ],
  instructions: `When presenting meta-analysis results:
- State both Fixed Effect and Random Effects pooled estimates (e.g. Pooled RR = 2.45 [95% CI: 1.82 - 3.30]).
- Report heterogeneity statistics: Cochran Q, degrees of freedom, p-value, and I² percentage.
- Structure study-level table with: Study Name, Sample Size, Effect Size, 95% CI, and Relative Weight %.`,
  examples: [
    'Synthesize PASI-75 response rates across Phase 3 trials of TYK2 inhibitor Deucravacitinib vs Active Comparator.',
    'Meta-analyze randomized controlled trials evaluating GLP-1 receptor agonists in MASLD/MASH fibrosis resolution.',
  ],
  helperScripts: {
    'meta_calc.py': `
import math

def compute_meta_analysis(studies):
    # studies: list of dicts with {"name": str, "effect": float, "se": float}
    k = len(studies)
    weights_fixed = [1.0 / (s["se"]**2) for s in studies]
    sum_w = sum(weights_fixed)
    
    # Fixed effect estimate
    theta_fixed = sum(w * s["effect"] for w, s in zip(weights_fixed, studies)) / sum_w
    se_fixed = math.sqrt(1.0 / sum_w)
    
    # Cochran's Q
    q = sum(w * ((s["effect"] - theta_fixed)**2) for w, s in zip(weights_fixed, studies))
    df = k - 1
    i2 = max(0.0, ((q - df) / q) * 100.0) if q > 0 else 0.0
    
    return {
        "num_studies": k,
        "pooled_effect": round(theta_fixed, 3),
        "pooled_ci_lower": round(theta_fixed - 1.96 * se_fixed, 3),
        "pooled_ci_upper": round(theta_fixed + 1.96 * se_fixed, 3),
        "cochran_q": round(q, 3),
        "i2_heterogeneity_pct": round(i2, 1)
    }
`,
  },
};
