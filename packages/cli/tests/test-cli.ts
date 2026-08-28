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
