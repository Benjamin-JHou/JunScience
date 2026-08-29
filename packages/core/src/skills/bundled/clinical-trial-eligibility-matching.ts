import { SkillDefinition } from '../../types/skills.js';

export const ClinicalTrialEligibilityMatchingSkill: SkillDefinition = {
  id: 'clinical-trial-eligibility-matching',
  name: 'clinical-trial-eligibility-matching',
  displayName: 'Patient Cohort & Clinical Trial Eligibility Matching',
  description: 'Parse unstructured patient clinical profiles and match against ClinicalTrials.gov Protocol Section inclusion/exclusion criteria (e.g. age, stage, prior lines of therapy, laboratory cutoffs).',
  category: 'clinical',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['clinical_trials_lookup', 'python_runner'],
  keywords: ['eligibility', 'matching', 'clinical trial', 'inclusion', 'exclusion', 'nct', 'patient', 'masld', 'nash'],
  workflowSteps: [
    '1. Parse patient phenotype: age, sex, primary diagnosis, fibrosis stage, comorbidities, prior medication failures.',
    '2. Retrieve active recruiting trials from ClinicalTrials.gov for the target condition.',
    '3. Extract and parse structured eligibility rules (age limits, sex restrictions) and text criteria.',
    '4. Match patient attributes against each inclusion and exclusion clause.',
    '5. Output a structured eligibility compatibility matrix with matched vs violated criteria for each candidate NCT.',
  ],
  instructions: `When matching clinical trial eligibility:
- Detail the exact reasons for eligibility or ineligibility per candidate trial.
- Explicitly list passed inclusion criteria and confirmed absent exclusion criteria.
- Highlight any borderline laboratory values or ambiguous clinical conditions that require PI review.`,
  examples: [
    'Match a 52-year-old MASLD patient with stage F2/F3 fibrosis against active Phase 3 MASH drug trials (NCT04104776, NCT04929210).',
    'Evaluate patient eligibility for allosteric TYK2 inhibitor clinical trials in moderate-to-severe plaque psoriasis.',
  ],
  helperScripts: {
    'eligibility_matcher.py': `
def match_patient_criteria(patient: dict, trial: dict) -> dict:
    violations = []
    
    # Age check
    if "min_age" in trial and patient.get("age", 0) < trial["min_age"]:
        violations.append(f"Age {patient['age']} below minimum {trial['min_age']}")
    if "max_age" in trial and patient.get("age", 999) > trial["max_age"]:
        violations.append(f"Age {patient['age']} above maximum {trial['max_age']}")
        
    # Gender check
    if trial.get("gender") and trial["gender"] != "ALL" and trial["gender"] != patient.get("gender"):
        violations.append(f"Gender {patient.get('gender')} does not match required {trial['gender']}")
        
    # Fibrosis Stage check
    required_stages = trial.get("required_fibrosis_stages", [])
    if required_stages and patient.get("fibrosis_stage") not in required_stages:
        violations.append(f"Fibrosis stage {patient.get('fibrosis_stage')} not in required {required_stages}")
        
    is_eligible = len(violations) == 0
    return {
        "nct_id": trial.get("nct_id", "UNKNOWN"),
        "trial_title": trial.get("title", ""),
        "eligible": is_eligible,
        "violations": violations,
        "match_score": 1.0 if is_eligible else round(max(0.0, 1.0 - len(violations) * 0.3), 2)
    }
`,
  },
};
