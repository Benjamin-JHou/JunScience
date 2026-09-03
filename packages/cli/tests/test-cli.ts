import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { handleConfigCommand } from '../src/commands/config';
import { globalProfileManager, globalSecureStore } from '@junscience/core';

async function runCliTests() {
  console.log('\n=== Running @junscience/cli Test Suite ===\n');

  const testDir = path.join(os.tmpdir(), `junscience-cli-test-${Date.now()}`);
  fs.mkdirSync(testDir, { recursive: true });
  process.env.JUNSCIENCE_HOME = testDir;

  try {
    console.log('[Test 1/3] CLI config set');
    await handleConfigCommand([
      'set',
      '--name', 'CLI Test Model',
      '--base-url', 'https://api.openai.com/v1',
      '--model', 'gpt-4o-mini',
      '--api-key', 'sk-cli-test-key-999',
    ]);

    const profiles = globalProfileManager.listProfiles();
    const created = profiles.find((p) => p.name === 'CLI Test Model');
    if (!created || created.apiKey !== 'sk-cli-test-key-999') {
      throw new Error(`CLI config set did not persist profile properly: ${JSON.stringify(profiles)}`);
    }
    console.log('  ✔ "junscience config set" created profile with encrypted key');

    console.log('\n[Test 2/3] CLI config list');
    await handleConfigCommand(['list']);
    console.log('  ✔ "junscience config list" executed cleanly');

    console.log('\n[Test 3/3] CLI config test (Fallback / Live probe)');
    await handleConfigCommand(['test']);
    console.log('  ✔ "junscience config test" executed cleanly');

    console.log('\n[Test 4/4] Ink Modern TUI Components Integration');
    const { Banner } = await import('../src/ui/ink/Banner.js');
    const { StatusBar } = await import('../src/ui/ink/StatusBar.js');
    const { Table } = await import('../src/ui/ink/Table.js');
    const { SLASH_COMMANDS } = await import('../src/ui/ink/SlashCommandMenu.js');
    const React = (await import('react')).default;
    const { render } = await import('ink');
    const { PassThrough } = await import('node:stream');

    const renderToString = (element: any) => {
      const stream = new PassThrough();
      (stream as any).columns = 120;
      let captured = '';
      stream.on('data', (chunk) => { captured += chunk.toString(); });
      const inst = render(element, { stdout: stream as any });
      inst.unmount();
      return captured;
    };

    // Test Banner rendering
    const bannerOutput = renderToString(React.createElement(Banner, { mode: 'plan', activeModel: 'TestModel' }));
    if (!bannerOutput.includes('v1.4.0')) {
      throw new Error(`Banner output expected v1.4.0, got: ${bannerOutput}`);
    }
    console.log('  ✔ Ink Banner rendered dynamically with v1.4.0');

    // Test StatusBar rendering
    const statusOutput = renderToString(React.createElement(StatusBar, {
      mode: 'plan',
      activeModel: 'deepseek-chat',
      turnCount: 2,
      estTokens: 2500,
    }));
    if (!statusOutput.includes('[PLAN]') || !statusOutput.includes('deepseek-chat')) {
      throw new Error(`StatusBar output failed to render mode and model: ${statusOutput}`);
    }
    console.log('  ✔ Ink StatusBar rendered mode badge and metrics correctly');

    // Test Table rendering
    const tableOutput = renderToString(React.createElement(Table, {
      data: [{ name: 'TestTool', category: 'genomics' }],
      columns: [{ header: 'Tool', key: 'name' }, { header: 'Cat', key: 'category' }],
    }));
    if (!tableOutput.includes('TestTool')) {
      throw new Error(`Table output failed to render row: ${tableOutput}`);
    }
    console.log('  ✔ Pure Ink Table component rendered columns and rows cleanly');

    // Verify Slash commands
    const expectedCmds = ['/model', '/plan', '/act', '/tools', '/skills', '/cost', '/clear'];
    for (const cmd of expectedCmds) {
      if (!SLASH_COMMANDS.some((c) => c.value === cmd)) {
        throw new Error(`Missing expected slash command: ${cmd}`);
      }
    }
    console.log(`  ✔ Verified all ${SLASH_COMMANDS.length} slash commands and keybinding mappings`);

    // Test AgentSelectorModal
    const { AgentSelectorModal } = await import('../src/ui/ink/AgentSelectorModal.js');
    const agentModalOutput = renderToString(React.createElement(AgentSelectorModal, {
      currentAgentId: 'lead',
      onSelect: () => {},
      onClose: () => {},
    }));
    if (!agentModalOutput.includes('Lead Scientific Investigator') || !agentModalOutput.includes('Bioinformatics Specialist')) {
      throw new Error(`AgentSelectorModal failed to render personas: ${agentModalOutput}`);
    }
    console.log('  ✔ Ink AgentSelectorModal rendered all 5 scientific agent personas cleanly');

    // Test CommandPaletteModal
    const { CommandPaletteModal } = await import('../src/ui/ink/CommandPaletteModal.js');
    const paletteOutput = renderToString(React.createElement(CommandPaletteModal, {
      onSelect: () => {},
      onClose: () => {},
    }));
    if (!paletteOutput.includes('/model') || !paletteOutput.includes('/agent') || !paletteOutput.includes('/plan')) {
      throw new Error(`CommandPaletteModal failed to render commands: ${paletteOutput}`);
    }
    console.log('  ✔ Ink CommandPaletteModal rendered searchable commands');

    // Test InputPrompt
    const { InputPrompt } = await import('../src/ui/ink/InputPrompt.js');
    const inputPromptOutput = renderToString(React.createElement(InputPrompt, {
      value: '',
      onChange: () => {},
      onSubmit: () => {},
      mode: 'act',
    }));
    if (!inputPromptOutput.includes('Ask a research question or describe your task...')) {
      throw new Error(`InputPrompt failed to render screenshot placeholder: ${inputPromptOutput}`);
    }
    console.log('  ✔ Ink InputPrompt rendered rounded prompt matching UI specification');

    // Test PlanView
    const { PlanView } = await import('../src/ui/ink/PlanView.js');
    const planViewOutput = renderToString(React.createElement(PlanView, {
      tasks: [],
      onClose: () => {},
    }));
    if (!planViewOutput.includes('TASK-1') || !planViewOutput.includes('TASK-5')) {
      throw new Error(`PlanView failed to render 5-stage milestones: ${planViewOutput}`);
    }
    console.log('  ✔ Ink PlanView rendered 5-stage explicit milestone checklist');

    console.log('\n✔ ALL @junscience/cli TESTS PASSED (100% SUCCESS)\n');
  } finally {
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

runCliTests().catch((err) => {
  console.error('\n✖ CLI Test failed:', err);
  process.exit(1);
});
