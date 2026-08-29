import { SkillDefinition } from '../../types/skills.js';

export const ManuscriptFormattingSkill: SkillDefinition = {
  id: 'manuscript-formatting',
  name: 'manuscript-formatting',
  displayName: 'Academic Scientific Manuscript & Journal Formatting',
  description: 'Format structured scientific research drafts into publication-ready LaTeX / Markdown manuscript frameworks adhering to target journal guidelines (e.g. Journal of Hepatology, Hepatology, Nature Medicine).',
  category: 'writing',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['python_runner'],
  keywords: ['manuscript', 'latex', 'journal', 'formatting', 'abstract', 'hepatology', 'masld', 'mash', 'writing'],
  workflowSteps: [
    '1. Identify target journal (e.g. Journal of Hepatology, Hepatology, Frontiers) and retrieve author formatting guidelines.',
    '2. Assemble structured Abstract (Background, Methods, Results, Conclusions) under strict word limits (250-300 words).',
    '3. Draft Introduction, Results (with Evidence Anchors), Discussion, and Methods.',
    '4. Structure Tables and Figures with publication-standard captions.',
    '5. Export clean LaTeX (.tex) manuscript scaffold and Markdown draft.',
  ],
  instructions: `When formatting scientific manuscripts:
- Adhere strictly to journal-specific heading styles, word limits, and citation formats.
- Ensure all numerical findings in Abstract and Results are accompanied by sample sizes, confidence intervals, and p-values.
- Generate a Data Availability Statement, Funding Declaration, and Conflicts of Interest section.`,
  examples: [
    'Format a clinical research manuscript on Resmetirom / Semaglutide in MASLD according to Journal of Hepatology author guidelines.',
    'Generate a LaTeX manuscript template for an autoimmune drug discovery study.',
  ],
  helperScripts: {
    'manuscript_formatter.py': `
def format_journal_manuscript(meta: dict, sections: dict, journal: str = "Journal of Hepatology") -> str:
    title = meta.get("title", "Untitled Manuscript")
    authors = meta.get("authors", "JunScience Research Consortium")
    abstract = sections.get("abstract", "")
    
    latex_doc = f"""\\\\documentclass[11pt,a4paper]{{article}}
\\\\usepackage[utf8]{{inputenc}}
\\\\usepackage{{amsmath,amssymb,graphicx,booktabs,hyperref,geometry}}
\\\\geometry{{margin=1in}}

\\\\title{{\\\\textbf{{{title}}}}}
\\\\author{{{authors}}}
\\\\date{{\\\\today}}

\\\\begin{{document}}
\\\\maketitle

\\\\begin{{abstract}}
{abstract}
\\\\end{{abstract}}

\\\\section{{Introduction}}
{sections.get("introduction", "")}

\\\\section{{Results}}
{sections.get("results", "")}

\\\\section{{Discussion}}
{sections.get("discussion", "")}

\\\\section{{Methods}}
{sections.get("methods", "")}

\\\\section*{{Data Availability Statement}}
All data analyzed in this study were derived from publicly accessible databases (UniProt, PDB, ChEMBL, openFDA, ClinicalTrials.gov) with immutable provenance tracking.

\\\\end{{document}}
"""
    return latex_doc
`,
  },
};
