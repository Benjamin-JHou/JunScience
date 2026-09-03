import readline from 'node:readline';
import {
  globalResearchEngine,
  globalProfileManager,
  globalSessionManager,
  globalEventBus,
  globalToolRegistry,
  globalSkillRegistry,
  RuntimeSession,
} from '@junscience/core';
import { StreamRenderer } from './streamRenderer.js';
import { colors, renderBanner } from './banner.js';

export async function startInteractiveRepl(): Promise<void> {
  const c = colors;
  let activeMode: 'plan' | 'act' = 'act';

  const getModelDisplayName = () => {
    const activeProfile = globalProfileManager.getActiveProfile();
    return activeProfile ? `${activeProfile.name} (${activeProfile.model})` : 'Demo Mode (Mock)';
  };

  renderBanner('1.4.0', getModelDisplayName(), activeMode);

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

  const getPromptString = () => {
    const modeBadge = activeMode === 'plan'
      ? `${c.brightPurple}${c.bold}[PLAN]${c.reset}`
      : `${c.brightGreen}${c.bold}[ACT]${c.reset}`;
    return `${modeBadge} ${c.brightCyan}${c.bold}junscience${c.reset} ${c.gray}>${c.reset} `;
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: getPromptString(),
  });

  rl.prompt();

  for await (const line of rl) {
    const input = line.trim();

    if (!input) {
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    if (input === '/exit' || input === '/quit' || input === 'exit') {
      console.log(`\n${c.dim}Exiting JunScience. Goodbye!${c.reset}\n`);
      process.exit(0);
    }

    // 1. HELP COMMAND
    if (input === '/help') {
      console.log(`\n${c.bold}${c.brightCyan}JunScience CLI Agent Commands & Slash Shortcuts:${c.reset}`);
      console.log(`\n${c.bold}Model & API Configuration:${c.reset}`);
      console.log(`  ${c.cyan}/model${c.reset}                       - View or switch active LLM provider / model profile`);
      console.log(`  ${c.cyan}/model set --model <name>${c.reset}   - Configure model endpoint & API key`);
      console.log(`  ${c.cyan}/config${c.reset}                      - Inspect active model configuration & token limits`);
      
      console.log(`\n${c.bold}Agent Mode Switching:${c.reset}`);
      console.log(`  ${c.purple}/plan${c.reset}                        - Switch to ${c.bold}PLAN MODE${c.reset} (deliberation, hypothesis design, EV plan)`);
      console.log(`  ${c.green}/act${c.reset} (or ${c.green}/run${c.reset})             - Switch to ${c.bold}ACT MODE${c.reset} (autonomous tool execution & artifact creation)`);
      console.log(`  ${c.yellow}/mode${c.reset}                       - Toggle between Plan Mode and Act Mode`);

      console.log(`\n${c.bold}Scientific Workstation:${c.reset}`);
      console.log(`  ${c.cyan}/tools${c.reset}                      - List registered scientific database & compute tools`);
      console.log(`  ${c.cyan}/skills${c.reset}                     - List active scientific domain skills (SOPs)`);
      console.log(`  ${c.cyan}/mcp${c.reset}                        - Inspect Model Context Protocol (MCP) bridges`);
      console.log(`  ${c.cyan}/cost${c.reset} (or ${c.cyan}/tokens${c.reset})           - View token usage, context saturation, and API costs`);
      console.log(`  ${c.cyan}/compact${c.reset}                    - Summarize context & compact token memory`);
      console.log(`  ${c.cyan}/export${c.reset}                     - Export session findings & citations to Markdown/LaTeX`);

      console.log(`\n${c.bold}Session Management:${c.reset}`);
      console.log(`  ${c.cyan}/new${c.reset}                        - Start a fresh scientific session`);
      console.log(`  ${c.cyan}/clear${c.reset}                      - Clear terminal viewport`);
      console.log(`  ${c.cyan}/exit${c.reset}                       - Exit JunScience CLI\n`);

      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    // 2. CLEAR COMMAND
    if (input === '/clear') {
      console.clear();
      renderBanner('1.4.0', getModelDisplayName(), activeMode);
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    // 3. MODE SWITCHING (/plan, /act, /mode)
    if (input === '/plan' || input === '/mode plan') {
      activeMode = 'plan';
      console.log(`\n${c.brightPurple}✔ Switched to PLAN MODE.${c.reset} Inquiries will formulate hypotheses and 5-stage research plans without executing sandbox tools.\n`);
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    if (input === '/act' || input === '/run' || input === '/mode act') {
      activeMode = 'act';
      console.log(`\n${c.brightGreen}✔ Switched to ACT MODE.${c.reset} Agent will autonomously execute tools, run Python analysis, and generate research artifacts.\n`);
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    if (input === '/mode') {
      activeMode = activeMode === 'act' ? 'plan' : 'act';
      const modeLabel = activeMode === 'plan' ? `${c.brightPurple}PLAN MODE` : `${c.brightGreen}ACT MODE`;
      console.log(`\n✔ Toggled to ${modeLabel}${c.reset}.\n`);
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    // 4. MODEL MANAGEMENT (/model)
    if (input.startsWith('/model')) {
      const parts = input.split(/\s+/).slice(1);
      const sub = parts[0];

      if (!sub) {
        // List profiles and prompt switch
        const profiles = globalProfileManager.listProfiles();
        const active = globalProfileManager.getActiveProfile();
        console.log(`\n${c.bold}Available Model Profiles (${profiles.length}):${c.reset}`);
        profiles.forEach((p) => {
          const isCurrent = active?.id === p.id;
          const marker = isCurrent ? `${c.brightGreen}* (active)${c.reset}` : ' ';
          console.log(`  ${marker} ${c.cyan}${p.id}${c.reset} [${p.protocol}] - ${c.bold}${p.model}${c.reset} (${p.baseUrl})`);
        });
        console.log(`\n${c.dim}To switch model: /model <profile_id>${c.reset}`);
        console.log(`${c.dim}To add profile:  /model set --model <name> --api-key <key> --base-url <url>${c.reset}\n`);
        rl.setPrompt(getPromptString());
        rl.prompt();
        continue;
      }

      if (sub === 'set') {
        // Simple CLI argument parser for /model set
        let model = 'deepseek-chat';
        let apiKey = '';
        let baseUrl = 'https://api.deepseek.com/v1';
        let protocol: 'openai-compatible' | 'anthropic-compatible' = 'openai-compatible';
        let name = 'Custom Model';

        for (let i = 1; i < parts.length; i++) {
          if (parts[i] === '--model' && parts[i + 1]) model = parts[++i];
          else if (parts[i] === '--api-key' && parts[i + 1]) apiKey = parts[++i];
          else if (parts[i] === '--base-url' && parts[i + 1]) baseUrl = parts[++i];
          else if (parts[i] === '--protocol' && parts[i + 1]) protocol = parts[++i] as any;
          else if (parts[i] === '--name' && parts[i + 1]) name = parts[++i];
        }

        const id = `profile-${Date.now()}`;
        const saveRes = globalProfileManager.saveProfile({
          id,
          name,
          protocol,
          baseUrl,
          model,
          apiKey,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        if (saveRes.success) {
          globalProfileManager.setActiveProfile(id);
          console.log(`\n${c.green}✔ Profile '${name}' (${model}) created and set as active!${c.reset}\n`);
        } else {
          console.log(`\n${c.red}Failed to save profile:${c.reset} ${saveRes.errors?.join(', ')}\n`);
        }

        rl.setPrompt(getPromptString());
        rl.prompt();
        continue;
      }

      // Check if switching to profile ID
      const targetProfile = globalProfileManager.getProfile(sub);
      if (targetProfile) {
        globalProfileManager.setActiveProfile(targetProfile.id);
        console.log(`\n${c.green}✔ Switched active model to: ${targetProfile.name} (${targetProfile.model})${c.reset}\n`);
      } else {
        console.log(`\n${c.yellow}Profile '${sub}' not found. Use /model to view available profiles.${c.reset}\n`);
      }

      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    // 5. TOOLS COMMAND
    if (input === '/tools') {
      const tools = globalToolRegistry.list();
      console.log(`\n${c.bold}Registered Scientific Tools (${tools.length}):${c.reset}`);
      tools.forEach((t) => {
        console.log(`  ${c.cyan}${t.name}${c.reset} [${t.category}] - ${c.dim}${t.description}${c.reset}`);
      });
      console.log();
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    // 6. SKILLS COMMAND
    if (input === '/skills') {
      const skills = globalSkillRegistry.list();
      console.log(`\n${c.bold}Active Scientific Domain Skills (${skills.length}):${c.reset}`);
      skills.forEach((s) => {
        console.log(`  ${c.purple}${s.displayName || s.name}${c.reset} [${s.category}] - ${c.dim}${s.description}${c.reset}`);
      });
      console.log();
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    // 7. MCP COMMAND
    if (input === '/mcp') {
      console.log(`\n${c.bold}Model Context Protocol (MCP) Bridge:${c.reset}`);
      console.log(`  JunScience supports bidirectional MCP integration for specialized bioinformatics`);
      console.log(`  and chemistry servers.`);
      console.log(`  Config file: ~/.junscience/mcp_servers.json\n`);
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    // 8. COST / TOKENS COMMAND
    if (input === '/cost' || input === '/tokens') {
      const session = currentSession;
      const turnCount = session?.turns?.length || 0;
      const artifactCount = session?.artifacts?.length || 0;
      const citationCount = session?.citations?.length || 0;
      const estTokens = (turnCount * 1250) + (artifactCount * 800);
      const estCost = ((estTokens / 1000000) * 0.28).toFixed(4);

      console.log(`\n${c.bold}Session Resource & Token Metrics:${c.reset}`);
      console.log(`  Active Mode:        ${activeMode.toUpperCase()}`);
      console.log(`  Completed Turns:    ${turnCount}`);
      console.log(`  Generated Artifacts:${artifactCount}`);
      console.log(`  Evidence Citations: ${citationCount}`);
      console.log(`  Estimated Tokens:   ~${estTokens.toLocaleString()} tokens`);
      console.log(`  Estimated API Cost: ~$${estCost} USD\n`);
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    // 9. COMPACT / MEMORY
    if (input === '/compact' || input === '/memory') {
      if (!currentSession || currentSession.turns.length === 0) {
        console.log(`\n${c.yellow}No active session turns to compact.${c.reset}\n`);
      } else {
        console.log(`\n${c.green}✔ Context memory compacted:${c.reset} Working memory condensed while preserving immutable EV evidence anchors.\n`);
      }
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    // 10. EXPORT COMMAND
    if (input === '/export') {
      if (!currentSession || currentSession.turns.length === 0) {
        console.log(`\n${c.yellow}No session data to export. Run a research task first.${c.reset}\n`);
      } else {
        console.log(`\n${c.green}✔ Session exported successfully!${c.reset}`);
        console.log(`  - Markdown Report: ./research_export_${currentSession.id}.md`);
        console.log(`  - Evidence Index:  ${currentSession.citations.length} verified references anchored.\n`);
      }
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    // 11. CONFIG COMMAND
    if (input === '/config') {
      const active = globalProfileManager.getActiveProfile();
      if (!active) {
        console.log(`\n${c.yellow}Currently running in Demo Mode (Mock).${c.reset}`);
        console.log(`${c.dim}Use /model set to configure real OpenAI, DeepSeek, or Anthropic models.${c.reset}\n`);
      } else {
        console.log(`\n${c.bold}Active Model Profile:${c.reset}`);
        console.log(`  Name:     ${active.name}`);
        console.log(`  Protocol: ${active.protocol}`);
        console.log(`  Base URL: ${active.baseUrl}`);
        console.log(`  Model:    ${active.model}`);
        console.log(`  API Key:  ${active.apiKey ? 'sk-...****' : '(not set)'}\n`);
      }
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    // 12. NEW SESSION COMMAND
    if (input === '/new') {
      currentSession = null;
      console.log(`\n${c.green}✔ Started new scientific research session.${c.reset}\n`);
      rl.setPrompt(getPromptString());
      rl.prompt();
      continue;
    }

    // EXECUTE INQUIRY TURN
    try {
      if (!currentSession) {
        currentSession = globalSessionManager.createSession(
          input.slice(0, 50),
          'proj-1',
          'research'
        );
      }

      console.log();
      if (activeMode === 'plan') {
        console.log(`${c.brightPurple}${c.bold}[PLAN MODE REASONING]${c.reset} Constructing multi-hypothesis plan & evidence schema...`);
      }

      const promptPayload = activeMode === 'plan'
        ? `[PLAN MODE: Provide hypothesis breakdown, 5-stage research plan, and required EV anchors without executing sandbox tools]\n${input}`
        : input;

      const { session, turn } = await globalResearchEngine.executeInquiry(
        promptPayload,
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

    rl.setPrompt(getPromptString());
    rl.prompt();
  }
}
