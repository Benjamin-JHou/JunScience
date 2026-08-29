import { globalHookRegistry } from '@junscience/core';
import { colors } from '../ui/banner.js';

export async function handleHooksCommand(args: string[]): Promise<void> {
  const c = colors;
  const subCommand = args[0] || 'list';

  if (subCommand === 'list' || subCommand === 'ls') {
    const hooks = globalHookRegistry.list();

    console.log(`\n${c.bold}${c.brightCyan}=== JunScience Mandatory Security & Scientific Hooks ===${c.reset}\n`);
    console.log(
      `${c.gray}Hooks are deterministic, non-bypassable guardrails executed across the research lifecycle.${c.reset}`
    );
    console.log();

    console.log(
      '  ' +
        `${c.bold}${'ID'.padEnd(30)}${'Events'.padEnd(20)}${'Status'.padEnd(14)}${'Priority'.padEnd(12)}Description${c.reset}`
    );
    console.log(`  ${c.gray}${'─'.repeat(105)}${c.reset}`);

    for (const h of hooks) {
      const statusStr = h.enabled ? `${c.brightGreen}● Active${c.reset}` : `${c.brightRed}○ Disabled${c.reset}`;
      const eventsStr = `${c.brightYellow}${h.events.join(', ')}${c.reset}`;
      const priorityStr = `${c.brightPurple}${h.priority || 50}${c.reset}`;
      console.log(
        '  ' +
          `${c.bold}${h.id.padEnd(30)}${c.reset}` +
          eventsStr.padEnd(29) +
          statusStr.padEnd(23) +
          priorityStr.padEnd(21) +
          `${c.dim}${h.description}${c.reset}`
      );
    }
    console.log();
    return;
  }

  console.log(`${c.yellow}Unknown hooks subcommand: "${subCommand}". Available: "junscience hooks list"${c.reset}`);
}
