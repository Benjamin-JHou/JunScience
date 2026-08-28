import { SkillDefinition } from '../../types/skills.js';

export const BibliometricAnalysisSkill: SkillDefinition = {
  id: 'bibliometric-analysis',
  name: 'bibliometric-analysis',
  displayName: 'Bibliometric & Co-Citation Network Analysis',
  description: 'Analyze publication trends, journal impact distributions, author collaboration clusters, and keyword co-occurrence frequencies across retrieved PubMed and OpenAlex literature corpora.',
  category: 'literature',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['literature_search', 'python_runner'],
  keywords: ['bibliometric', 'co-citation', 'trend', 'author', 'journal', 'cluster', 'keyword', 'network'],
  workflowSteps: [
    '1. Execute systematic literature queries on PubMed/OpenAlex across multi-year publication windows.',
    '2. Extract publication metadata: year, journal, author affiliations, and MeSH / author keywords.',
    '3. Pass structured citation list to Python sandbox to compute temporal publication velocity.',
    '4. Construct keyword co-occurrence matrix and identify leading thematic clusters.',
    '5. Synthesize findings into publication timeline and landmark paper rankings.',
  ],
  instructions: `When conducting bibliometric analysis:
- Track temporal shifts in research focus (e.g. initial target discovery vs recent clinical Phase 3 trials).
- Identify top contributing research groups and foundational landmark papers by citation volume.
- Detect emerging keywords and therapeutic modalities (e.g. allosteric inhibition, PROTACs, biologics).`,
  examples: [
    'Analyze 10-year bibliometric publication trajectory for allosteric TYK2 inhibitors.',
    'Map author collaboration network and key themes in lupus nephritis genetics.',
  ],
};
