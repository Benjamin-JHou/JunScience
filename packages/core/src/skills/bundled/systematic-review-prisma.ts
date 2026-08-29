import { SkillDefinition } from '../../types/skills.js';

export const SystematicReviewPrismaSkill: SkillDefinition = {
  id: 'systematic-review-prisma',
  name: 'systematic-review-prisma',
  displayName: 'PRISMA 2020 Systematic Review Workflow & Flowchart Generator',
  description: 'Track literature search counts, deduplication, screening exclusions with structured reasons, and generate standard PRISMA 2020 four-phase flowchart data.',
  category: 'literature',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['literature_search', 'clinical_trials_lookup', 'python_runner'],
  keywords: ['prisma', 'systematic review', 'flowchart', 'screening', 'deduplication', 'inclusion', 'literature', 'meta-analysis'],
  workflowSteps: [
    '1. Formulate structured search strings across biomedical databases (PubMed, Europe PMC, ClinicalTrials.gov).',
    '2. Aggregate total records identified and remove duplicate DOIs/PMIDs.',
    '3. Screen titles and abstracts, logging exclusion category frequencies.',
    '4. Retrieve full-text candidate articles and assess final eligibility.',
    '5. Render structured PRISMA 2020 node counts and flowchart table for publication.',
  ],
  instructions: `When generating PRISMA 2020 summaries:
- Record exact counts for every stage: Initial identified, Duplicates removed, Screened, Excluded at screening (with breakdown), Full-text assessed, Excluded at full-text (with breakdown), and Finally included.
- Present the PRISMA summary as a structured Markdown table or Mermaid flowchart.
- State explicit inclusion and exclusion criteria applied during screening.`,
  examples: [
    'Generate PRISMA 2020 screening flow for systematic review of allosteric TYK2 inhibitors in autoimmune diseases.',
    'Track literature screening and selection for pharmacotherapy in MASLD / MASH fibrosis.',
  ],
  helperScripts: {
    'prisma_generator.py': `
def generate_prisma_summary(raw_counts: dict) -> dict:
    total_identified = sum(raw_counts.get("database_counts", {}).values())
    duplicates = raw_counts.get("duplicates_removed", 0)
    screened = total_identified - duplicates
    screen_excluded = raw_counts.get("screening_excluded", 0)
    fulltext_assessed = screened - screen_excluded
    fulltext_excluded = sum(raw_counts.get("fulltext_excluded_reasons", {}).values())
    included = fulltext_assessed - fulltext_excluded
    
    return {
        "identification": {
            "total_records": total_identified,
            "by_database": raw_counts.get("database_counts", {})
        },
        "deduplication": {
            "duplicates_removed": duplicates,
            "unique_records": screened
        },
        "screening": {
            "records_screened": screened,
            "excluded": screen_excluded
        },
        "eligibility": {
            "fulltext_assessed": fulltext_assessed,
            "excluded": fulltext_excluded,
            "exclusion_reasons": raw_counts.get("fulltext_excluded_reasons", {})
        },
        "included_studies_count": included
    }
`,
  },
};
