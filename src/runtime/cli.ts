import { globalResearchEngine } from './research-loop/ResearchEngine';
import { globalEventBus } from './core/EventBus';
import './tools/index';

declare const process: any;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'research';
  const inquiry = args.slice(1).join(' ') || 'Investigate the role of TAD boundary disruption and STAT4/TYK2 in autoimmune disease';

  console.log(`\x1b[36m===============================================================\x1b[0m`);
  console.log(`\x1b[1m\x1b[35m  ⚛ JunScience Scientific Agent Runtime (Headless CLI)\x1b[0m`);
  console.log(`\x1b[36m===============================================================\x1b[0m`);
  console.log(`\x1b[33m[Command]\x1b[0m ${command}`);
  console.log(`\x1b[33m[Inquiry]\x1b[0m ${inquiry}\n`);

  // Subscribe to live event bus
  globalEventBus.onAll((event) => {
    const time = new Date(event.timestamp).toLocaleTimeString();
    if (event.type === 'agent.started') {
      console.log(`\x1b[34m[${time}] [Agent Started]\x1b[0m Objective: ${event.payload.objective}`);
    } else if (event.type === 'agent.thinking') {
      console.log(`\x1b[35m[${time}] [Reasoning]\x1b[0m ${event.payload.thought}`);
    } else if (event.type === 'tool.started') {
      console.log(`\x1b[32m[${time}] [Tool Call]\x1b[0m ${event.payload.toolName} (${event.payload.category})`);
    } else if (event.type === 'tool.progress') {
      console.log(`     ↳ ${event.payload.log}`);
    } else if (event.type === 'tool.completed') {
      console.log(`  \x1b[32m✔\x1b[0m Completed in ${event.payload.execution.duration}: ${event.payload.execution.resultSummary}`);
    } else if (event.type === 'artifact.created') {
      console.log(`\x1b[36m[${time}] [Artifact Created]\x1b[0m ${event.payload.artifact.title} (${event.payload.artifact.type})`);
    } else if (event.type === 'citation.created') {
      console.log(`\x1b[33m[${time}] [Citation Logged]\x1b[0m ${event.payload.citation.title} - ${event.payload.citation.journal} (${event.payload.citation.year})`);
    }
  });

  const result = await globalResearchEngine.executeAutonomousResearch(inquiry);

  console.log(`\n\x1b[32m===============================================================\x1b[0m`);
  console.log(`\x1b[1m\x1b[32m  ✔ Investigation Successfully Completed\x1b[0m`);
  console.log(`\x1b[32m===============================================================\x1b[0m`);
  console.log(`\n${result.turn.agentResponse}\n`);
  console.log(`\x1b[1m[Reproducibility & Provenance]\x1b[0m`);
  console.log(`• Dataset: ${result.provenance.dataset}`);
  console.log(`• Code: ${result.provenance.code}`);
  console.log(`• Environment: ${result.provenance.environment}`);
  console.log(`• Total Execution Time: ${result.provenance.duration}`);
  console.log(`• Artifacts Generated: ${result.artifacts.length}`);
  console.log(`• Citations Verified: ${result.session.citations.length}`);
}

main().catch((err) => {
  console.error('[JunScience CLI Error]', err);
  process.exit(1);
});
