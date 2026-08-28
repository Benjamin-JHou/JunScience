import { colors } from './banner.js';
import { Citation, Artifact } from '@junscience/core';

export class StreamRenderer {
  private isThinking: boolean = false;

  public startThought(phase: string, thought: string): void {
    const c = colors;
    this.isThinking = true;
    console.log(`\n${c.yellow}✦ [${phase}]${c.reset} ${c.dim}${thought}${c.reset}`);
  }

  public renderDelta(delta: string): void {
    if (this.isThinking) {
      this.isThinking = false;
      process.stdout.write(`\n`);
    }
    process.stdout.write(delta);
  }

  public renderToolStart(toolName: string, input: any): void {
    const c = colors;
    console.log(`\n${c.cyan}⚙ Tool Calling: ${c.bold}${toolName}${c.reset} ${c.dim}${JSON.stringify(input).slice(0, 80)}${c.reset}`);
  }

  public renderToolProgress(log: string, percent?: number): void {
    const c = colors;
    const pStr = percent !== undefined ? ` [${percent}%]` : '';
    console.log(`  ${c.gray}↳ ${log}${pStr}${c.reset}`);
  }

  public renderToolCompleted(toolName: string, summary?: string, duration?: string): void {
    const c = colors;
    const durStr = duration ? ` (${duration})` : '';
    console.log(`  ${c.green}✔ ${toolName} completed${durStr}:${c.reset} ${summary || 'Success'}`);
  }

  public renderArtifacts(artifacts: Artifact[]): void {
    if (!artifacts || artifacts.length === 0) return;
    const c = colors;
    console.log(`\n${c.purple}${c.bold}📦 Synthesized Scientific Artifacts:${c.reset}`);
    artifacts.forEach((art, idx) => {
      console.log(`  ${c.brightPurple}[${idx + 1}] ${art.title}${c.reset} ${c.dim}(${art.type.toUpperCase()})${c.reset}`);
      if (art.metadata) {
        Object.entries(art.metadata).forEach(([k, v]) => {
          console.log(`      ${c.gray}• ${k}: ${v}${c.reset}`);
        });
      }
    });
  }

  public renderCitations(citations: Citation[]): void {
    if (!citations || citations.length === 0) return;
    const c = colors;
    console.log(`\n${c.blue}${c.bold}📚 Primary Literature & Verified Evidence:${c.reset}`);
    citations.forEach((cit) => {
      const doiStr = cit.doi ? ` • DOI: ${cit.doi}` : '';
      const pmidStr = cit.pmid ? ` • PMID: ${cit.pmid}` : '';
      console.log(`  ${c.brightBlue}[${cit.index}] ${cit.title}${c.reset}`);
      console.log(`      ${c.gray}${cit.authors} (${cit.year}) • ${cit.journal}${doiStr}${pmidStr}${c.reset}`);
    });
  }
}
