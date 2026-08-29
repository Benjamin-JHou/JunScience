import { SkillDefinition } from '../../types/skills.js';

export const FigureGenerationSkill: SkillDefinition = {
  id: 'figure-generation',
  name: 'figure-generation',
  displayName: 'Publication-Ready Scientific Figure Generation',
  description: 'Generate publication-grade matplotlib and seaborn visual schematics conforming to high-impact journal standards (300 DPI, vector PDF/EPS export, Arial font, and colorblind-safe palettes).',
  category: 'visualization',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['python_runner'],
  keywords: ['figure', 'matplotlib', 'seaborn', 'publication', '300 dpi', 'visualization', 'chart', 'plot', 'dpi'],
  workflowSteps: [
    '1. Define figure dimensions conforming to standard single-column (85 mm) or double-column (175 mm) journal widths.',
    '2. Apply colorblind-safe palettes (e.g. Okabe-Ito, Viridis) with high contrast.',
    '3. Configure sans-serif Arial typography and minimal clean spines.',
    '4. Plot primary data points with error bars (mean ± SEM or 95% CI).',
    '5. Render and export figure at 300 DPI PNG and vector PDF formats.',
  ],
  instructions: `When generating scientific figures:
- Ensure all axes have clear physical units (e.g. "Concentration (nM)", "Survival Probability (%)", "Time (Months)").
- Add panel letters (A, B, C) in bold font at the top-left of each sub-panel.
- Save both high-resolution PNG (300 DPI) and scalable vector PDF in the sandbox artifacts directory.`,
  examples: [
    'Generate a publication-ready multi-panel figure containing a Volcano plot, Kaplan-Meier survival curve, and Dose-Response curve.',
    'Create a high-resolution Forest plot for meta-analysis of clinical trial endpoints.',
  ],
  helperScripts: {
    'figure_template.py': `
import matplotlib.pyplot as plt

def setup_publication_style():
    plt.rcParams.update({
        'font.family': 'sans-serif',
        'font.sans-serif': ['Arial', 'Helvetica', 'DejaVu Sans'],
        'font.size': 8,
        'axes.labelsize': 8,
        'axes.titlesize': 9,
        'xtick.labelsize': 7,
        'ytick.labelsize': 7,
        'legend.fontsize': 7,
        'figure.dpi': 300,
        'savefig.dpi': 300,
        'axes.spines.top': False,
        'axes.spines.right': False,
        'axes.linewidth': 0.8,
        'lines.linewidth': 1.2
    })
`,
  },
};
