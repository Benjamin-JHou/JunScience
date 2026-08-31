import { SkillDefinition } from '../types/skills.js';
import { PathwayEnrichmentSkill } from './bundled/pathway-enrichment.js';
import { BibliometricAnalysisSkill } from './bundled/bibliometric-analysis.js';
import { SarPharmacophoreMappingSkill } from './bundled/sar-pharmacophore-mapping.js';
import { ProteinDomainArchitectSkill } from './bundled/protein-domain-architect.js';
import { SequenceAlignmentSkill } from './bundled/sequence-alignment.js';
import { StructureSuperpositionSkill } from './bundled/structure-superposition.js';
import { AdmetPredictionSkill } from './bundled/admet-prediction.js';
import { ChemicalSimilaritySearchSkill } from './bundled/chemical-similarity-search.js';
import { DifferentialExpressionAnalysisSkill } from './bundled/differential-expression-analysis.js';
import { SurvivalAnalysisSkill } from './bundled/survival-analysis.js';
import { MetaAnalysisForestPlotSkill } from './bundled/meta-analysis-forest-plot.js';
import { AdverseEventSignalDetectionSkill } from './bundled/adverse-event-signal-detection.js';
import { ClinicalTrialEligibilityMatchingSkill } from './bundled/clinical-trial-eligibility-matching.js';
import { SystematicReviewPrismaSkill } from './bundled/systematic-review-prisma.js';
import { CitationNetworkMappingSkill } from './bundled/citation-network-mapping.js';
import { RadiomicsFeatureExtractionSkill } from './bundled/radiomics-feature-extraction.js';
import { ManuscriptFormattingSkill } from './bundled/manuscript-formatting.js';
import { FigureGenerationSkill } from './bundled/figure-generation.js';
import { ReproducibilityPackagingSkill } from './bundled/reproducibility-packaging.js';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

export class SkillRegistry {
  private skills: Map<string, SkillDefinition> = new Map();
  private userSkillsDir: string;

  constructor(userSkillsDir?: string) {
    const baseHome = process.env.JUNSCIENCE_HOME || path.join(os.homedir(), '.junscience');
    this.userSkillsDir = userSkillsDir || path.join(baseHome, 'skills');
    this.initBundledSkills();
    this.loadUserInstalledSkills();
  }

  private initBundledSkills(): void {
    // 1. Molecular & Structural Biology
    this.register(PathwayEnrichmentSkill);
    this.register(ProteinDomainArchitectSkill);
    this.register(SequenceAlignmentSkill);
    this.register(StructureSuperpositionSkill);

    // 2. Cheminformatics
    this.register(SarPharmacophoreMappingSkill);
    this.register(AdmetPredictionSkill);
    this.register(ChemicalSimilaritySearchSkill);

    // 3. Statistics & Bioinformatics
    this.register(DifferentialExpressionAnalysisSkill);
    this.register(SurvivalAnalysisSkill);
    this.register(MetaAnalysisForestPlotSkill);

    // 4. Clinical
    this.register(AdverseEventSignalDetectionSkill);
    this.register(ClinicalTrialEligibilityMatchingSkill);

    // 5. Literature
    this.register(BibliometricAnalysisSkill);
    this.register(SystematicReviewPrismaSkill);
    this.register(CitationNetworkMappingSkill);

    // 6. Imaging, Writing & Reproducibility
    this.register(RadiomicsFeatureExtractionSkill);
    this.register(ManuscriptFormattingSkill);
    this.register(FigureGenerationSkill);
    this.register(ReproducibilityPackagingSkill);
  }

  public register(skill: SkillDefinition): void {
    this.skills.set(skill.id, skill);
  }

  public get(id: string): SkillDefinition | undefined {
    return this.skills.get(id);
  }

  public list(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  public listBundled(): SkillDefinition[] {
    return this.list().filter((s) => s.bundled);
  }

  public listUserInstalled(): SkillDefinition[] {
    return this.list().filter((s) => !s.bundled);
  }

  public loadUserInstalledSkills(): void {
    if (!fs.existsSync(this.userSkillsDir)) {
      return;
    }

    try {
      const entries = fs.readdirSync(this.userSkillsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const skillPath = path.join(this.userSkillsDir, entry.name, 'SKILL.md');
        if (fs.existsSync(skillPath)) {
          const content = fs.readFileSync(skillPath, 'utf-8');
          const skillDef = this.parseSkillMarkdown(entry.name, content);
          if (skillDef) {
            this.register(skillDef);
          }
        }
      }
    } catch {
      // ignore user folder scan errors
    }
  }

  public parseSkillMarkdown(folderName: string, content: string): SkillDefinition | null {
    try {
      const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
      const match = content.match(frontmatterRegex);

      const parsedData: Record<string, any> = {};
      let bodyInstructions = content;

      if (match) {
        const rawYaml = match[1];
        bodyInstructions = match[2] || '';

        let currentKey = '';
        const lines = rawYaml.split('\n');

        for (let line of lines) {
          line = line.trimEnd();
          if (!line || line.trim().startsWith('#')) continue;

          // Check if line is a list item: - value
          const listMatch = line.match(/^(\s*)-\s+(.*)$/);
          if (listMatch && currentKey) {
            if (!Array.isArray(parsedData[currentKey])) {
              parsedData[currentKey] = [];
            }
            parsedData[currentKey].push(listMatch[2].replace(/^["']|["']$/g, '').trim());
            continue;
          }

          // Check if line is a key: value
          const kvMatch = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
          if (kvMatch) {
            currentKey = kvMatch[1].trim();
            const val = kvMatch[2].trim();
            if (val === '') {
              // May be followed by a list on subsequent lines
              parsedData[currentKey] = [];
            } else {
              // Strip surrounding quotes
              const unquoted = val.replace(/^["']|["']$/g, '');
              parsedData[currentKey] = unquoted;
            }
          }
        }
      }

      const id = parsedData.id || folderName;
      const name = parsedData.name || folderName;
      const displayName = parsedData.displayName || parsedData.name || folderName;
      const description = parsedData.description || 'Custom user scientific skill';
      const category = parsedData.category || 'literature';
      const version = parsedData.version || '1.0.0';
      const author = parsedData.author || 'User Local';
      const requiredTools = Array.isArray(parsedData.requiredTools)
        ? parsedData.requiredTools
        : typeof parsedData.requiredTools === 'string'
        ? parsedData.requiredTools.split(',').map((t: string) => t.trim())
        : ['python_runner'];

      const keywords = Array.isArray(parsedData.keywords)
        ? parsedData.keywords
        : typeof parsedData.keywords === 'string'
        ? parsedData.keywords.split(',').map((k: string) => k.trim())
        : [folderName, ...displayName.toLowerCase().split(/\s+/)];

      const workflowSteps = Array.isArray(parsedData.workflowSteps)
        ? parsedData.workflowSteps
        : typeof parsedData.workflowSteps === 'string'
        ? parsedData.workflowSteps.split('\n').filter(Boolean)
        : ['Follow instructions specified in user SKILL.md document.'];

      return {
        id,
        name,
        displayName,
        description,
        category: category as any,
        version,
        author,
        bundled: false,
        requiredTools,
        keywords,
        workflowSteps,
        instructions: bodyInstructions.trim() || content,
        examples: parsedData.examples || [],
      };
    } catch {
      return null;
    }
  }

  public discover(query: string, maxResults: number = 3): SkillDefinition[] {
    const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    if (queryTokens.length === 0) return [];

    const scored = this.list().map((skill) => {
      let score = 0;
      const haystack = [
        skill.id,
        skill.name,
        skill.displayName,
        skill.description,
        ...skill.keywords,
      ].join(' ').toLowerCase();

      for (const token of queryTokens) {
        if (haystack.includes(token)) score += 3;
        if (skill.keywords.some((kw) => kw.includes(token))) score += 6;
      }

      return { skill, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map((s) => s.skill);
  }

  public formatPromptForInquiry(inquiry: string): string {
    const matched = this.discover(inquiry, 3);
    if (matched.length === 0) return '';

    let prompt = `\n### 🔬 Activated Scientific Skills (Standard Operating Procedures)\n`;
    for (const skill of matched) {
      prompt += `#### Skill: ${skill.displayName} (${skill.category})\n`;
      prompt += `${skill.description}\n`;
      prompt += `**Workflow:**\n${skill.workflowSteps.join('\n')}\n`;
      prompt += `**Operating Guidelines:**\n${skill.instructions}\n\n`;
    }
    return prompt;
  }
}

export const globalSkillRegistry = new SkillRegistry();
