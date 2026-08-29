import { SkillDefinition } from '../../types/skills.js';

export const AdverseEventSignalDetectionSkill: SkillDefinition = {
  id: 'adverse-event-signal-detection',
  name: 'adverse-event-signal-detection',
  displayName: 'Pharmacovigilance Disproportionality & FAERS Signal Detection',
  description: 'Quantify adverse event reporting disproportionality from spontaneous reporting databases (openFDA FAERS) using Reporting Odds Ratio (ROR), Proportional Reporting Ratio (PRR), and 95% confidence intervals.',
  category: 'clinical',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['openfda_lookup', 'python_runner'],
  keywords: ['adverse event', 'faers', 'ror', 'prr', 'pharmacovigilance', 'safety', 'openfda', 'disproportionality', 'signal'],
  workflowSteps: [
    '1. Query openFDA FAERS endpoint for target drug (e.g. Deucravacitinib) and background database event counts.',
    '2. Construct 2x2 contingency matrix (a: drug+event, b: drug+other, c: other_drugs+event, d: other_drugs+other).',
    '3. Compute Reporting Odds Ratio (ROR) and standard error.',
    '4. Calculate 95% Wald confidence intervals (ROR_025, ROR_975).',
    '5. Filter for verified safety signals where case count >= 3 and ROR_025 > 1.0.',
  ],
  instructions: `When evaluating pharmacovigilance safety signals:
- Report case count (a), ROR point estimate, and 95% Confidence Interval [ROR_025, ROR_975].
- Distinguish between expected disease-associated symptoms and genuine potential drug safety signals.
- Cross-reference positive signals against official FDA package insert warnings.`,
  examples: [
    'Detect post-marketing adverse event signals for Deucravacitinib from openFDA FAERS reports.',
    'Compare infection and thrombosis signal ratios between pan-JAK inhibitors and selective TYK2 inhibitors.',
  ],
  helperScripts: {
    'faers_ror.py': `
import math

def compute_ror(a: int, b: int, c: int, d: int) -> dict:
    if b == 0 or c == 0:
        return {"ror": None, "signal": False, "reason": "Zero cell count"}
    
    ror = (a * d) / (b * c)
    se_ln_ror = math.sqrt(1.0/a + 1.0/b + 1.0/c + 1.0/d)
    ci_lower = math.exp(math.log(ror) - 1.96 * se_ln_ror)
    ci_upper = math.exp(math.log(ror) + 1.96 * se_ln_ror)
    
    is_signal = (a >= 3) and (ci_lower > 1.0)
    
    return {
        "case_count": a,
        "ror": round(ror, 3),
        "ci_95_lower": round(ci_lower, 3),
        "ci_95_upper": round(ci_upper, 3),
        "positive_signal": is_signal
    }
`,
  },
};
