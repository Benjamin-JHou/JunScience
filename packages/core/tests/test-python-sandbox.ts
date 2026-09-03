import { PythonRunnerTool, ToolContext } from '../src/index.js';

const dummyContext: ToolContext = {
  sessionId: `test-sandbox-${Date.now()}`,
  agentId: 'research',
  turnIndex: 0,
  reportProgress: (log: string) => {},
};

async function testPythonSandbox() {
  console.log('=== Running Cross-Platform Python Sandbox Security Suite ===\n');

  // Test 1: Legitimate computation & Artifact output
  console.log('[Test 1/4] Legitimate Statistical Computation & Artifact Output');
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

  const originalSandboxPolicy = process.env.JUNSCIENCE_SANDBOX;
  process.env.JUNSCIENCE_SANDBOX = 'disabled';
  const validRes = await PythonRunnerTool.execute({ scriptContent: validScript, scriptName: 'compute_stats.py' }, dummyContext);
  if (!validRes.success || !validRes.output.stdout.includes('Calculated Mean: 15.42') || validRes.output.isAirGapped) {
    throw new Error(`Explicitly authorized unconfined execution was reported incorrectly: ${JSON.stringify(validRes)}`);
  }
  console.log(`  ✔ Explicit unconfined mode is labeled accurately: [${validRes.output.sandboxMode}]`);

  // Test 2: Missing kernel driver must fail closed
  console.log('\n[Test 2/4] Missing Sandbox Driver Fails Closed');
  const originalPath = process.env.PATH;
  delete process.env.JUNSCIENCE_SANDBOX;
  process.env.PATH = '';
  const unavailableRes = await PythonRunnerTool.execute(
    { scriptContent: 'print("must not run")', scriptName: 'unavailable.py' },
    dummyContext
  );
  process.env.PATH = originalPath;
  if (unavailableRes.success || !unavailableRes.error?.includes('[SandboxEnforcementError]')) {
    throw new Error(`PythonRunnerTool fell back to an unconfined process: ${JSON.stringify(unavailableRes)}`);
  }
  console.log('  ✔ Execution blocked when no kernel sandbox driver was discoverable.');

  // Test 3: A usable driver must be air-gapped; an unusable driver must not fall back
  console.log('\n[Test 3/4] Kernel Sandbox Application Is Fail-Closed');
  const kernelRes = await PythonRunnerTool.execute(
    { scriptContent: 'print("kernel sandbox active")', scriptName: 'kernel_probe.py' },
    dummyContext
  );
  if (kernelRes.success && !kernelRes.output.isAirGapped) {
    throw new Error('Kernel sandbox execution succeeded without an air-gap classification');
  }
  if (!kernelRes.success && kernelRes.output?.sandboxMode?.includes('Fallback')) {
    throw new Error('Kernel sandbox application failure silently fell back to host execution');
  }
  console.log(
    kernelRes.success
      ? `  ✔ Kernel sandbox executed with air-gap: [${kernelRes.output.sandboxMode}]`
      : '  ✔ Kernel sandbox could not be applied and execution remained blocked.'
  );

  // Test 4: Script filename must not escape before the sandbox process starts
  console.log('\n[Test 4/4] Script Filename Path Traversal Rejection');
  const traversalRes = await PythonRunnerTool.execute(
    { scriptContent: 'print("should not run")', scriptName: '../../../escape.py' },
    dummyContext
  );
  if (traversalRes.success || !traversalRes.error?.includes('scriptName must be a plain filename')) {
    throw new Error(`PythonRunnerTool accepted a path-traversing scriptName: ${JSON.stringify(traversalRes)}`);
  }
  console.log('  ✔ Path-traversing scriptName rejected before any host file write.');

  if (originalSandboxPolicy === undefined) {
    delete process.env.JUNSCIENCE_SANDBOX;
  } else {
    process.env.JUNSCIENCE_SANDBOX = originalSandboxPolicy;
  }

  console.log('\n✔ ALL PYTHON SANDBOX SECURITY TESTS PASSED (100% SUCCESS)\n');
}

testPythonSandbox().catch((err) => {
  console.error('\n✖ Python sandbox test failed:', err);
  process.exit(1);
});
