import {
  globalProfileManager,
  createDefaultProfile,
  GenericModelClient,
  fallbackMockProvider,
  ProtocolType,
} from '@junscience/core';
import { colors } from '../ui/banner.js';

export async function handleConfigCommand(args: string[]): Promise<void> {
  const c = colors;
  const subcommand = args[0] || 'list';

  switch (subcommand) {
    case 'list': {
      const profiles = globalProfileManager.listProfiles();
      const active = globalProfileManager.getActiveProfile();
      console.log(`\n${c.bold}Configured Model Profiles:${c.reset}`);
      if (profiles.length === 0) {
        console.log(`  ${c.yellow}(No profiles configured. Currently running in Demo Mode (Mock).)${c.reset}`);
        console.log(`  ${c.dim}Run "junscience config set --base-url <url> --api-key <key> --model <name>" to add a model.${c.reset}\n`);
        return;
      }

      profiles.forEach((p) => {
        const isActive = active?.id === p.id;
        const activeTag = isActive ? `${c.brightGreen}${c.bold}[ACTIVE]${c.reset}` : '';
        const keyMask = p.apiKey ? `sk-...${p.apiKey.slice(-4)}` : '(none)';
        console.log(`\n  ${c.bold}${p.name}${c.reset} ${activeTag}`);
        console.log(`    ${c.gray}ID:${c.reset} ${p.id}`);
        console.log(`    ${c.gray}Protocol:${c.reset} ${p.protocol}`);
        console.log(`    ${c.gray}Base URL:${c.reset} ${p.baseUrl}`);
        console.log(`    ${c.gray}Model:${c.reset} ${p.model}`);
        console.log(`    ${c.gray}API Key:${c.reset} ${keyMask}`);
      });
      console.log();
      break;
    }

    case 'set': {
      let baseUrl = '';
      let apiKey = '';
      let model = '';
      let name = '';
      let protocol: ProtocolType = 'openai-compatible';

      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--base-url' && args[i + 1]) baseUrl = args[++i];
        else if (args[i] === '--api-key' && args[i + 1]) apiKey = args[++i];
        else if (args[i] === '--model' && args[i + 1]) model = args[++i];
        else if (args[i] === '--name' && args[i + 1]) name = args[++i];
        else if (args[i] === '--protocol' && args[i + 1]) protocol = args[++i] as ProtocolType;
      }

      if (!baseUrl && !apiKey && !model && !name) {
        console.log(`${c.red}Error:${c.reset} Missing arguments for config set.`);
        console.log(`Usage: junscience config set --base-url <url> --api-key <key> --model <name> [--name <label>] [--protocol <openai-compatible|anthropic-compatible>]\n`);
        return;
      }

      const active = globalProfileManager.getActiveProfile();
      const profileToSave = active
        ? {
            ...active,
            baseUrl: baseUrl || active.baseUrl,
            apiKey: apiKey !== undefined ? apiKey : active.apiKey,
            model: model || active.model,
            name: name || active.name,
            protocol: protocol || active.protocol,
          }
        : createDefaultProfile({
            baseUrl: baseUrl || 'https://api.openai.com/v1',
            apiKey,
            model: model || 'gpt-4o',
            name: name || 'Primary Model',
            protocol,
          });

      const res = globalProfileManager.saveProfile(profileToSave);
      if (!res.success) {
        console.log(`${c.red}Failed to save profile:${c.reset} ${res.errors?.join(', ')}\n`);
        return;
      }

      console.log(`\n${c.green}✔ Successfully saved model profile:${c.reset} ${c.bold}${res.profile?.name}${c.reset}`);
      console.log(`  ${c.gray}Base URL:${c.reset} ${res.profile?.baseUrl}`);
      console.log(`  ${c.gray}Model:${c.reset} ${res.profile?.model}`);
      console.log(`  ${c.dim}Encrypted API key stored in ~/.junscience/credentials.enc${c.reset}\n`);
      break;
    }

    case 'test': {
      const active = globalProfileManager.getActiveProfile();
      if (!active || !active.baseUrl || !active.model) {
        console.log(`\n${c.yellow}No active user profile configured. Testing Demo Mode (Mock)...${c.reset}`);
        const result = await fallbackMockProvider.testConnection();
        console.log(`  ${c.green}✔ ${result.message}${c.reset}\n`);
        return;
      }

      console.log(`\n${c.cyan}Testing connection to "${active.name}" (${active.baseUrl})...${c.reset}`);
      const client = new GenericModelClient(active);
      const testResult = await client.testConnection();

      if (testResult.success) {
        console.log(`  ${c.green}${c.bold}✔ Connection Successful!${c.reset}`);
        console.log(`  ${c.gray}Latency:${c.reset} ${testResult.latencyMs}ms`);
        console.log(`  ${c.gray}Response:${c.reset} ${testResult.message}\n`);
      } else {
        console.log(`  ${c.red}${c.bold}✖ Connection Failed!${c.reset}`);
        console.log(`  ${c.gray}Latency:${c.reset} ${testResult.latencyMs}ms`);
        console.log(`  ${c.red}Error:${c.reset} ${testResult.error}\n`);
      }
      break;
    }

    case 'delete': {
      const id = args[1];
      if (!id) {
        console.log(`${c.red}Usage:${c.reset} junscience config delete <profileId>\n`);
        return;
      }
      const deleted = globalProfileManager.deleteProfile(id);
      if (deleted) {
        console.log(`${c.green}✔ Deleted profile ${id}${c.reset}\n`);
      } else {
        console.log(`${c.red}Profile not found: ${id}${c.reset}\n`);
      }
      break;
    }

    default:
      console.log(`Unknown config subcommand: ${subcommand}`);
      console.log(`Available: list, set, test, delete\n`);
  }
}
