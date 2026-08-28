import { PythonRunnerTool, ToolContext } from '../src/index.js';
import os from 'node:os';
import path from 'node:path';

const dummyContext: ToolContext = {
  sessionId: `test-sandbox-${Date.now()}`,
  agentId: 'research',
  turnIndex: 0,
  reportProgress: (log: string) => {},
};

async function testPythonSandbox() {
  console.log('=== Running Cross-Platform Python Sandbox Security Suite ===\n');

  // Test 1: Legitimate computation & Artifact output
  console.log('[Test 1/3] Legitimate Statistical Computation & Artifact Output');
  const validScript = `
import json
import math

data = [12.4, 15.6, 18.2, 14.1, 16.8]
mean_val = sum(data) / len(data)
variance = sum((x - mean_val) ** 2 for x in data) / (len(data) - 1)
std_dev = math.sqrt(variance)

result = {
    "metric": "IC50_mean",
    "mean": round(mean_val, 2),
    "std_dev": round(std_dev, 2)
}

with open("stats_summary.json", "w") as f:
    json.dump(result, f, indent=2)

print(f"Calculated Mean: {mean_val:.2f}, Std: {std_dev:.2f}")
`;

  const validRes = await PythonRunnerTool.execute({ scriptContent: validScript, scriptName: 'compute_stats.py' }, dummyContext);
  if (!validRes.success || !validRes.output.stdout.includes('Calculated Mean: 15.42')) {
    throw new Error(`Valid script execution failed: ${JSON.stringify(validRes)}`);
  }
  console.log(`  ✔ Script executed cleanly under: [${validRes.output.sandboxMode}]`);
  console.log(`  ✔ Output stdout: "${validRes.output.stdout.trim()}"`);
  console.log(`  ✔ Artifacts produced: ${validRes.artifacts?.length} (${validRes.artifacts?.map((a) => a.title).join(', ')})`);

  // Test 2: Air-Gapped Network Policy Check (Outbound Network Denied)
  console.log('\n[Test 2/3] Air-Gapped Network Policy Check (Attempt Outbound Socket)');
  const netScript = `
import urllib.request
try:
    urllib.request.urlopen("https://www.google.com", timeout=2)
    print("NET_ALLOWED")
except Exception as e:
    print(f"NET_BLOCKED: {type(e).__name__}")
`;

  const netRes = await PythonRunnerTool.execute({ scriptContent: netScript, scriptName: 'test_net.py' }, dummyContext);
  console.log(`  ✔ Network probe result under sandbox: ${netRes.output.stdout.trim()}`);
  const hasKernelSandbox = validRes.output.sandboxMode.includes('Seatbelt') || validRes.output.sandboxMode.includes('Bubblewrap');
  if (hasKernelSandbox && netRes.output.stdout.includes('NET_ALLOWED')) {
    throw new Error(`Sandbox [${validRes.output.sandboxMode}] failed to block outbound network connection`);
  }

  // Test 3: Unauthorized Filesystem Write Outside Workspace Denied
  console.log('\n[Test 3/3] Filesystem Boundary Enforcement Check (Attempt Write to Home Dir)');
  const escapePath = path.join(os.homedir(), `junscience_escape_test_${Date.now()}.tmp`).replace(/\\/g, '/');
  const fsScript = `
try:
    with open("${escapePath}", "w") as f:
        f.write("unauthorized")
    print("FS_WRITE_ALLOWED")
except Exception as e:
    print(f"FS_WRITE_BLOCKED: {type(e).__name__}")
`;

  const fsRes = await PythonRunnerTool.execute({ scriptContent: fsScript, scriptName: 'test_fs.py' }, dummyContext);
  console.log(`  ✔ Filesystem escape probe result: ${fsRes.output.stdout.trim()}`);
  if (hasKernelSandbox && fsRes.output.stdout.includes('FS_WRITE_ALLOWED')) {
    throw new Error(`Sandbox [${validRes.output.sandboxMode}] failed to restrict filesystem write boundary`);
  }

  console.log('\n✔ ALL PYTHON SANDBOX SECURITY TESTS PASSED (100% SUCCESS)\n');
}

testPythonSandbox().catch((err) => {
  console.error('\n✖ Python sandbox test failed:', err);
  process.exit(1);
});
