import readline from 'node:readline';
import {
  globalResearchEngine,
  globalProfileManager,
  globalSessionManager,
  globalEventBus,
  globalToolRegistry,
  RuntimeSession,
} from '@junscience/core';
import { StreamRenderer } from './streamRenderer.js';
import { colors, renderBanner } from './banner.js';

export async function startInteractiveRepl(): Promise<void> {
  const c = colors;
  const activeProfile = globalProfileManager.getActiveProfile();
  const modelName = activeProfile ? `${activeProfile.name} (${activeProfile.model})` : 'Demo Mode (Mock)';

  renderBanner('1.0.0', modelName);

  console.log(`${c.dim}Type your scientific inquiry, or type /help for commands, /exit to quit.${c.reset}\n`);

  let currentSession: RuntimeSession | null = null;
  const renderer = new StreamRenderer();

  // Attach event bus listeners
  globalEventBus.on('agent.thinking', (e) => {
    renderer.startThought(e.payload.phase || 'Reasoning', e.payload.thought);
  });
  globalEventBus.on('tool.started', (e) => {
    renderer.renderToolStart(e.payload.toolName, e.payload.input);
  });
  globalEventBus.on('tool.progress', (e) => {
    renderer.renderToolProgress(e.payload.log, e.payload.percent);
  });
  globalEventBus.on('tool.completed', (e) => {
    renderer.renderToolCompleted(
      e.payload.execution.toolName,
      e.payload.execution.resultSummary,
      e.payload.execution.duration
    );
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${c.brightGreen}${c.bold}junscience${c.reset} ${c.gray}>${c.reset} `,
  });

  rl.prompt();

  for await (const line of rl) {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      continue;
    }

    if (input === '/exit' || input === '/quit' || input === 'exit') {
      console.log(`\n${c.dim}Exiting JunScience. Goodbye!${c.reset}\n`);
      process.exit(0);
    }

    if (input === '/help') {
      console.log(`\n${c.bold}JunScience CLI Commands:${c.reset}`);
      console.log(`  ${c.cyan}/new${c.reset}        - Start a fresh scientific session`);
      console.log(`  ${c.cyan}/config${c.reset}     - Display current model/API configuration`);
      console.log(`  ${c.cyan}/tools${c.reset}      - List available scientific database & compute tools`);
      console.log(`  ${c.cyan}/clear${c.reset}      - Clear terminal screen`);
      console.log(`  ${c.cyan}/exit${c.reset}       - Exit the interactive CLI\n`);
      rl.prompt();
      continue;
    }

    if (input === '/clear') {
      console.clear();
      renderBanner('1.0.0', modelName);
      rl.prompt();
      continue;
    }

    if (input === '/tools') {
      const tools = globalToolRegistry.list();
      console.log(`\n${c.bold}Registered Scientific Tools (${tools.length}):${c.reset}`);
      tools.forEach((t) => {
        console.log(`  ${c.cyan}${t.name}${c.reset} [${t.category}] - ${c.dim}${t.description}${c.reset}`);
      });
      console.log();
      rl.prompt();
      continue;
    }

    if (input === '/config') {
      const active = globalProfileManager.getActiveProfile();
      if (!active) {
        console.log(`\n${c.yellow}Currently running in Demo Mode (Mock).${c.reset}\n`);
      } else {
        console.log(`\n${c.bold}Active Model Profile:${c.reset}`);
        console.log(`  Name:     ${active.name}`);
        console.log(`  Protocol: ${active.protocol}`);
        console.log(`  Base URL: ${active.baseUrl}`);
        console.log(`  Model:    ${active.model}`);
        console.log(`  API Key:  ${active.apiKey ? 'sk-...****' : '(not set)'}\n`);
      }
      rl.prompt();
      continue;
    }

    if (input === '/new') {
      currentSession = null;
      console.log(`\n${c.green}✔ Started new scientific research session.${c.reset}\n`);
      rl.prompt();
      continue;
    }

    // Execute inquiry turn
    try {
      if (!currentSession) {
        currentSession = globalSessionManager.createSession(
          input.slice(0, 50),
          'proj-1',
          'research'
        );
      }

      console.log();
      const { session, turn } = await globalResearchEngine.executeInquiry(
        input,
        currentSession.id,
        (delta) => renderer.renderDelta(delta)
      );

      currentSession = session;
      renderer.renderArtifacts(session.artifacts);
      renderer.renderCitations(session.citations);
      console.log();
    } catch (err: any) {
      console.log(`\n${c.red}Error executing turn:${c.reset} ${err?.message || String(err)}\n`);
    }

    rl.prompt();
  }
}
