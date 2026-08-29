import { SkillDefinition } from '../../types/skills.js';

export const SurvivalAnalysisSkill: SkillDefinition = {
  id: 'survival-analysis',
  name: 'survival-analysis',
  displayName: 'Kaplan-Meier Survival Analysis & Log-Rank Testing',
  description: 'Compute non-parametric Kaplan-Meier survival curves, Greenwood standard errors, median survival times, and Log-Rank comparative statistics across clinical trial cohorts.',
  category: 'statistics',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['python_runner'],
  keywords: ['survival', 'kaplan meier', 'log rank', 'hazard ratio', 'pfs', 'os', 'censoring', 'clinical trial'],
  workflowSteps: [
    '1. Collect time-to-event (months/days), event indicator (1=event, 0=censored), and treatment groups.',
    '2. Construct life-table survival probability estimates at each unique event interval.',
    '3. Estimate Greenwood standard errors and 95% log-log confidence bounds.',
    '4. Extract median survival duration for active treatment vs control arms.',
    '5. Perform Mantel-Cox Log-Rank test to evaluate whether survival distributions differ significantly.',
  ],
  instructions: `When reporting survival outcomes:
- Report median survival with 95% CI for each group (or indicate "Not Reached" if >50% remain event-free).
- Report the Log-Rank p-value, observed vs expected event ratios (O/E), and estimated Hazard Ratio (HR).
- Present key landmark survival rates (e.g. 6-month, 12-month, 24-month survival percentages).`,
  examples: [
    'Evaluate overall survival and progression-free survival in a Phase 3 autoimmune clinical trial cohort.',
    'Compare survival outcomes between high-expression vs low-expression biomarker subgroups.',
  ],
  helperScripts: {
    'kaplan_meier.py': `
def compute_km_table(times, events):
    # times: list of durations, events: list of 1 (event) or 0 (censored)
    data = sorted(zip(times, events), key=lambda x: x[0])
    unique_times = sorted(list(set(t for t, e in data if e == 1)))
    
    n_at_risk = len(data)
    surv_prob = 1.0
    km_points = [{"time": 0.0, "survival_prob": 1.0, "at_risk": n_at_risk, "events": 0}]
    
    for t in unique_times:
        d = sum(1 for ti, ei in data if ti == t and ei == 1)
        c = sum(1 for ti, ei in data if ti == t and ei == 0)
        n = sum(1 for ti, ei in data if ti >= t)
        if n > 0:
            surv_prob *= (1.0 - (d / n))
            km_points.append({
                "time": t,
                "survival_prob": round(surv_prob, 4),
                "at_risk": n,
                "events": d
            })
    return km_points
`,
  },
};
