import {
  globalResearchEngine,
  globalEventBus,
} from '@junscience/core';
import { StreamRenderer } from '../ui/streamRenderer.js';
import { colors } from '../ui/banner.js';

export async function handleResearchCommand(inquiry: string): Promise<void> {
  const c = colors;
  if (!inquiry || !inquiry.trim()) {
    console.log(`${c.red}Error:${c.reset} Please provide a research question or inquiry.`);
    console.log(`Example: junscience research "Investigate STAT4 phosphorylation in lupus nephritis"\n`);
    return;
  }

  const renderer = new StreamRenderer();

  // Attach event bus listeners for rich terminal rendering
  const unThinking = globalEventBus.on('agent.thinking', (e) => {
    renderer.startThought(e.payload.phase || 'Reasoning', e.payload.thought);
  });

  const unPlanCreated = globalEventBus.on('plan.created', (e) => {
    renderer.renderPlan(e.payload.tasks);
  });

  const unPlanTaskUpdated = globalEventBus.on('plan.task.updated', (e) => {
    renderer.renderTaskUpdate(e.payload.task);
  });

  const unToolStart = globalEventBus.on('tool.started', (e) => {
    renderer.renderToolStart(e.payload.toolName, e.payload.input);
  });

  const unToolProg = globalEventBus.on('tool.progress', (e) => {
    renderer.renderToolProgress(e.payload.log, e.payload.percent);
  });

  const unToolComp = globalEventBus.on('tool.completed', (e) => {
    renderer.renderToolCompleted(
      e.payload.execution.toolName,
      e.payload.execution.resultSummary,
      e.payload.execution.duration
    );
  });

  console.log(`\n${c.bold}Initiating Autonomous Scientific Research Loop...${c.reset}`);
  console.log(`${c.gray}Inquiry:${c.reset} ${inquiry}\n`);

  try {
    const { session, turn } = await globalResearchEngine.executeInquiry(
      inquiry,
      undefined,
      (delta) => renderer.renderDelta(delta)
    );

    // Render artifacts and citations
    renderer.renderArtifacts(session.artifacts);
    renderer.renderCitations(session.citations);

    console.log(`\n${c.green}${c.bold}✔ Research turn completed successfully.${c.reset}\n`);
  } catch (err: any) {
    console.log(`\n${c.red}${c.bold}✖ Research execution failed:${c.reset} ${err?.message || String(err)}\n`);
  } finally {
    unThinking();
    unPlanCreated();
    unPlanTaskUpdated();
    unToolStart();
    unToolProg();
    unToolComp();
  }
}
