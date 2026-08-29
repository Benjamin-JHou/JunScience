import { handleConfigCommand } from './commands/config.js';
import { handleResearchCommand } from './commands/research.js';
import { handleHooksCommand } from './commands/hooks.js';
import { handleSkillCommand } from './commands/skill.js';
import { startInteractiveRepl } from './ui/repl.js';

export async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    // Start interactive REPL when invoked with no args (e.g. `junscience`)
    await startInteractiveRepl();
    return;
  }

  switch (command) {
    case 'config':
      await handleConfigCommand(args.slice(1));
      break;

    case 'hooks':
    case 'hook':
      await handleHooksCommand(args.slice(1));
      break;

    case 'skill':
    case 'skills':
      await handleSkillCommand(args.slice(1));
      break;

    case 'research':
    case 'run':
      await handleResearchCommand(args.slice(1).join(' '));
      break;

    case '--help':
    case '-h':
    case 'help':
      console.log(`
JunScience CLI — Scientific AI Workstation & Autonomous Research Engine

Usage:
  junscience                          Start interactive scientific REPL (Plan & Act modes)
  junscience research "<inquiry>"     Execute a one-shot autonomous scientific research inquiry
  junscience config list              List configured model profiles
  junscience config set [options]     Configure an OpenAI/Anthropic-compatible endpoint
  junscience config test              Probe connection and measure latency to active model
  junscience config delete <id>       Delete a model profile

Options for 'config set':
  --base-url <url>      API Base URL (e.g. https://api.deepseek.com/v1)
  --api-key <key>       API Key (stored in local AES-256-GCM vault)
  --model <name>        Model Identifier (e.g. deepseek-chat, gpt-4o)
  --name <label>        Friendly Profile Name
  --protocol <type>     openai-compatible | anthropic-compatible
`);
      break;

    default:
      // If single string provided, execute as research inquiry
      await handleResearchCommand(args.join(' '));
      break;
  }
}

main().catch((err) => {
  console.error('CLI Fatal Error:', err);
  process.exit(1);
});
