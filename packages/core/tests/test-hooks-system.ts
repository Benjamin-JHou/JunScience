import {
  globalHookRegistry,
  HookRegistry,
  HookContext,
  AutonomousResearchEngine,
  ScientificMockProvider,
  globalSessionManager,
  EvidenceTracker,
  PermissionManager,
  ToolRegistry,
} from '../src/index.js';

async function testHooksSystem() {
  console.log('=== Running JunScience Formal Hooks System Verification Suite ===\n');

  // [Test 1/5] Hook Registry Listing & Builtin Registration
  console.log('[Test 1/5] Hook Registry Listing & Builtin Registration');
  const hooks = globalHookRegistry.list();
  console.log(`  ✔ Found ${hooks.length} registered built-in hooks:`);
  for (const h of hooks) {
    console.log(`    - [${h.id}] Events: (${h.events.join(', ')}), Priority: ${h.priority}, Enabled: ${h.enabled}`);
  }

  if (hooks.length < 4) {
    throw new Error(`Expected at least 4 built-in hooks, found ${hooks.length}`);
  }
  const hookIds = hooks.map((h) => h.id);
  if (!hookIds.includes('secret-redaction') || !hookIds.includes('evidence-verifier') || !hookIds.includes('clinical-data-gate') || !hookIds.includes('evidence-completeness-check')) {
    throw new Error(`Missing expected built-in hooks. Found: ${hookIds.join(', ')}`);
  }
  if (globalHookRegistry.disableHook('secret-redaction') || globalHookRegistry.unregister('evidence-verifier')) {
    throw new Error('Mandatory security hooks can be disabled or unregistered');
  }
  const exposedHook = globalHookRegistry.get('secret-redaction');
  if (!exposedHook) throw new Error('Mandatory secret-redaction hook is unavailable');
  exposedHook.enabled = false;
  if (!globalHookRegistry.get('secret-redaction')?.enabled) {
    throw new Error('HookRegistry exposed a mutable mandatory hook definition');
  }
  console.log('  ✔ All 4 mandatory security and scientific hooks registered with correct event bindings.\n');

  const permissionManager = new PermissionManager();
  const trustedNetwork = await permissionManager.checkPermission(
    'permission-test',
    'NETWORK',
    'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
    'Query PubMed'
  );
  const spoofedNetwork = await permissionManager.checkPermission(
    'permission-test',
    'NETWORK',
    'https://eutils.ncbi.nlm.nih.gov.attacker.example/steal',
    'Spoof allowlisted host'
  );
  const unknownInstall = await permissionManager.checkPermission(
    'permission-test',
    'INSTALL',
    'unknown-package',
    'Install untrusted package'
  );
  if (!trustedNetwork || spoofedNetwork || unknownInstall) {
    throw new Error('PermissionManager did not enforce exact allowlists and fail-closed prompts');
  }
  console.log('  ✔ Permission checks allow exact trusted origins and fail closed otherwise.\n');

  // [Test 2/5] PreToolUse Hook: Secret & Credential Redaction Guard
  console.log('[Test 2/5] PreToolUse Hook: Secret & Credential Redaction Guard');
  const secretContext: HookContext = {
    sessionId: 'test-secret-session',
    turnIndex: 1,
    agentId: 'research',
    event: 'PreToolUse',
    timestamp: new Date().toISOString(),
  };

  // Case A: Clean tool arguments -> Should pass
  const cleanRes = await globalHookRegistry.triggerPreToolUse(secretContext, {
    toolName: 'uniprot_lookup',
    toolArguments: { accessionOrGene: 'TYK2' },
  });
  if (!cleanRes.proceed || cleanRes.verdict !== 'PASSED') {
    throw new Error(`Clean arguments unexpectedly blocked: ${cleanRes.message}`);
  }
  console.log('  ✔ Clean tool arguments passed PreToolUse hook verification.');

  // Case B: Secret leak in tool arguments -> Must be BLOCKED
  const leakedKeyRes = await globalHookRegistry.triggerPreToolUse(secretContext, {
    toolName: 'python_runner',
    toolArguments: {
      scriptName: 'test.py',
      code: 'import os; openai_key = "sk-1234567890abcdef1234567890abcdef12345678"',
    },
  });
  if (leakedKeyRes.proceed || leakedKeyRes.verdict !== 'BLOCKED') {
    throw new Error('SecretRedactionHook failed to block API key leak in tool arguments');
  }
  console.log(`  ✔ API Key leak successfully intercepted: ${leakedKeyRes.message}`);

  const repeatedLeakedKeyRes = await globalHookRegistry.triggerPreToolUse(secretContext, {
    toolName: 'python_runner',
    toolArguments: {
      scriptName: 'test.py',
      code: 'import os; openai_key = "sk-1234567890abcdef1234567890abcdef12345678"',
    },
  });
  if (repeatedLeakedKeyRes.proceed || repeatedLeakedKeyRes.verdict !== 'BLOCKED') {
    throw new Error('SecretRedactionHook leaked a repeated API key due to stateful RegExp.lastIndex');
  }
  console.log('  ✔ Repeated identical API key was blocked without stateful regex bypass.');

  let bypassToolExecuted = false;
  const isolatedRegistry = new ToolRegistry();
  isolatedRegistry.register({
    name: 'hook_bypass_probe',
    description: 'Probe mandatory pre-tool hooks',
    category: 'execution',
    requiredPermission: 'READ',
    inputSchema: { type: 'object' },
    execute: async () => {
      bypassToolExecuted = true;
      return {
        success: true,
        output: 'unexpected',
        execution: {
          id: 'probe',
          toolName: 'hook_bypass_probe',
          category: 'execution',
          description: 'Unexpected execution',
          status: 'completed',
          logs: [],
        },
      };
    },
  });
  const bypassProbe = await isolatedRegistry.execute(
    'hook_bypass_probe',
    { token: 'sk-abcdefghijklmnopqrstuvwxyz123456' },
    'hook-bypass-session',
    'research'
  );
  if (bypassProbe.success || bypassToolExecuted) {
    throw new Error('ToolRegistry allowed direct execution to bypass mandatory hooks');
  }
  console.log('  ✔ ToolRegistry enforces mandatory hooks for every execution path.');

  // Case C: ID Card leak in tool arguments -> Must be BLOCKED
  const idLeakRes = await globalHookRegistry.triggerPreToolUse(secretContext, {
    toolName: 'clinical_nlp_analyze',
    toolArguments: {
      text: 'Patient ID: 110101199003072345 admitted with pneumonia',
    },
  });
  if (idLeakRes.proceed || idLeakRes.verdict !== 'BLOCKED') {
    throw new Error('SecretRedactionHook failed to block Resident ID card leak');
  }
  console.log(`  ✔ National ID card leak successfully intercepted: ${idLeakRes.message}\n`);

  // [Test 3/5] PreToolUse Hook: Clinical Data Privacy Gate
  console.log('[Test 3/5] PreToolUse Hook: Clinical Data Privacy Gate');
  const clinicalContext: HookContext = {
    sessionId: 'test-clinical-session',
    turnIndex: 1,
    agentId: 'research',
    event: 'PreToolUse',
    timestamp: new Date().toISOString(),
  };

  const blockedClinicalRes = await globalHookRegistry.triggerPreToolUse(clinicalContext, {
    toolName: 'clinical_nlp_analyze',
    toolArguments: {
      clinicalNoteText: 'Patient presented with acute SLE exacerbation, high ANA titers, treated with methylprednisolone pulse therapy.',
    },
    isExternalApi: true,
  });

  if (blockedClinicalRes.proceed || blockedClinicalRes.verdict !== 'BLOCKED') {
    throw new Error('ClinicalDataGateHook failed to block unauthorized raw clinical text transmission to external API');
  }
  console.log(`  ✔ Unconfirmed raw clinical text transmission successfully blocked by privacy gate.`);

  const allowedLocalRes = await globalHookRegistry.triggerPreToolUse(clinicalContext, {
    toolName: 'clinical_nlp_analyze',
    toolArguments: {
      clinicalNoteText: 'Patient presented with acute SLE exacerbation, high ANA titers, treated with methylprednisolone pulse therapy.',
    },
    isExternalApi: false, // Local sandbox processing
  });

  if (!allowedLocalRes.proceed) {
    throw new Error('ClinicalDataGateHook blocked valid local sandbox processing');
  }
  console.log(`  ✔ Local sandbox processing authorized without external privacy leakage.\n`);

  let externalProviderCalls = 0;
  const externalProvider = {
    name: 'External Capture Provider',
    isExternal: true,
    listModels: async () => ['capture-model'],
    generate: async () => {
      externalProviderCalls++;
      return { content: 'unexpected', finishReason: 'stop' as const };
    },
    stream: async () => {
      externalProviderCalls++;
      return { content: 'unexpected', finishReason: 'stop' as const };
    },
  };
  const privacySession = globalSessionManager.createSession('Privacy Gate Test', 'demo-user');
  const privacyEngine = new AutonomousResearchEngine({
    modelProvider: externalProvider,
    maxTurns: 1,
  });
  const privacyTurn = await privacyEngine.run(
    privacySession,
    'Patient name: John Doe; MRN: 123456. Patient presented with chest pain and was admitted yesterday.'
  );
  if (externalProviderCalls !== 0 || privacyTurn.status !== 'cancelled') {
    throw new Error('Raw clinical inquiry reached the external model provider before authorization');
  }
  console.log('  ✔ Raw clinical inquiry blocked before the external model provider was called.\n');

  // [Test 4/5] PostToolUse Hook: Evidence Verifier Boundary & Anomaly Gate
  console.log('[Test 4/5] PostToolUse Hook: Evidence Verifier Boundary & Anomaly Gate');
  const postContext: HookContext = {
    sessionId: 'test-post-session',
    turnIndex: 1,
    agentId: 'research',
    event: 'PostToolUse',
    timestamp: new Date().toISOString(),
  };

  // Case A: Valid IC50 & p-value
  const validPostRes = await globalHookRegistry.triggerPostToolUse(postContext, {
    toolName: 'python_runner',
    toolArguments: { scriptName: 'compute_ic50.py' },
    result: {
      callId: 'call-1',
      name: 'python_runner',
      output: { ic50: 12.5, pValue: 0.001, status: 'success' },
      execution: { success: true, durationMs: 45, category: 'computation', resultSummary: 'IC50 = 12.5 nM' },
    },
  });

  if (!validPostRes.proceed || validPostRes.verdict !== 'ADOPTED') {
    throw new Error(`Valid computational output rejected: ${validPostRes.message}`);
  }
  console.log('  ✔ Valid computational data approved and marked ADOPTED.');

  // Case B: Impossible p-value (p = 1.45 > 1.0) -> Must be REJECTED
  const invalidPRes = await globalHookRegistry.triggerPostToolUse(postContext, {
    toolName: 'python_runner',
    toolArguments: { scriptName: 'stats.py' },
    result: {
      callId: 'call-2',
      name: 'python_runner',
      output: { pValue: 1.45, status: 'success' },
      execution: { success: true, durationMs: 30, category: 'computation' },
    },
  });

  if (invalidPRes.proceed || invalidPRes.verdict !== 'REJECTED') {
    throw new Error('EvidenceVerifierHook failed to reject p-value > 1.0');
  }
  console.log(`  ✔ Anomalous p-value (p=1.45 > 1.0) successfully intercepted: ${invalidPRes.message}`);

  // Case C: Negative IC50 -> Must be REJECTED
  const negativeIc50Res = await globalHookRegistry.triggerPostToolUse(postContext, {
    toolName: 'chembl_lookup',
    toolArguments: { target: 'TYK2' },
    result: {
      callId: 'call-3',
      name: 'chembl_lookup',
      output: { ic50: -5.2 },
      execution: { success: true, durationMs: 20, category: 'databases' },
    },
  });

  if (negativeIc50Res.proceed || negativeIc50Res.verdict !== 'REJECTED') {
    throw new Error('EvidenceVerifierHook failed to reject negative IC50');
  }
  console.log(`  ✔ Physically impossible IC50 (-5.2 nM) successfully intercepted: ${negativeIc50Res.message}\n`);

  const failedToolRes = await globalHookRegistry.triggerPostToolUse(postContext, {
    toolName: 'uniprot_lookup',
    toolArguments: { accessionOrGene: 'TYK2' },
    result: {
      callId: 'call-failed',
      name: 'uniprot_lookup',
      output: null,
      error: 'Upstream database unavailable',
      execution: {
        id: 'exec-failed',
        toolName: 'uniprot_lookup',
        category: 'databases',
        description: 'Lookup failed',
        status: 'failed',
        logs: [],
      },
    },
  });
  if (failedToolRes.proceed || failedToolRes.verdict !== 'REJECTED') {
    throw new Error('EvidenceVerifierHook adopted a failed tool execution');
  }
  console.log('  ✔ Failed tool execution rejected before evidence adoption.\n');

  // [Test 5/5] Stop Hook: Evidence Completeness & Integrity Check
  console.log('[Test 5/5] Stop Hook: Evidence Completeness & Integrity Check');
  const stopContext: HookContext = {
    sessionId: 'test-stop-session',
    turnIndex: 1,
    agentId: 'research',
    event: 'Stop',
    timestamp: new Date().toISOString(),
  };

  const tracker = new EvidenceTracker();
  tracker.record('uniprot_lookup', 'databases', 'TYK2', 'Resolved P29597', { accession: 'P29597' }); // EV-1
  tracker.record('chembl_lookup', 'databases', 'TYK2', 'IC50 = 12.5 nM', { ic50: 12.5 }); // EV-2

  // Case A: Complete valid evidence citations
  const validReport = `The study demonstrates that Deucravacitinib targets TYK2 [Evidence: EV-1] with high affinity [Evidence: EV-2].`;
  const validStopRes = await globalHookRegistry.triggerStop(stopContext, {
    session: globalSessionManager.createSession('research', 'demo-user'),
    turnIndex: 1,
    userInquiry: 'Assess TYK2 evidence',
    finalContent: validReport,
    evidenceTracker: tracker,
  });

  if (!validStopRes.proceed || validStopRes.verdict !== 'PASSED') {
    throw new Error(`Valid report failed Stop completeness check: ${validStopRes.message}`);
  }
  console.log(`  ✔ Valid evidence chain verified: ${validStopRes.message}`);

  // Case B: Dangling non-existent evidence citation (EV-999) -> Must be FLAGGED
  const danglingReport = `The compound also cures arthritis [Evidence: EV-999] without side effects.`;
  const danglingStopRes = await globalHookRegistry.triggerStop(stopContext, {
    session: globalSessionManager.createSession('research', 'demo-user'),
    turnIndex: 1,
    userInquiry: 'Assess TYK2 evidence',
    finalContent: danglingReport,
    evidenceTracker: tracker,
  });

  if (danglingStopRes.proceed || danglingStopRes.verdict !== 'FLAGGED' || !danglingStopRes.issues || danglingStopRes.issues.length === 0) {
    throw new Error('EvidenceCompletenessHook failed to flag dangling EV-999 citation');
  }
  console.log(`  ✔ Dangling citation successfully detected: ${danglingStopRes.message}`);
  console.log(`    Issue: ${danglingStopRes.issues[0]}\n`);

  const ungroundedProvider = {
    name: 'Ungrounded Local Provider',
    isExternal: false,
    listModels: async () => ['ungrounded-model'],
    generate: async () => ({ content: 'Unsupported conclusion without evidence.', finishReason: 'stop' as const }),
    stream: async () => ({ content: 'Unsupported conclusion without evidence.', finishReason: 'stop' as const }),
  };
  const ungroundedSession = globalSessionManager.createSession('Critique Fail-Closed Test', 'demo-user');
  const ungroundedEngine = new AutonomousResearchEngine({
    modelProvider: ungroundedProvider,
    maxTurns: 1,
  });
  const ungroundedTurn = await ungroundedEngine.run(ungroundedSession, 'Make an unsupported scientific claim');
  if (ungroundedTurn.status !== 'error' || !ungroundedTurn.agentResponse.includes('[Integrity Gate Failed]')) {
    throw new Error('AutonomousResearchEngine marked a critique-rejected report as completed');
  }
  console.log('  ✔ Critique rejection remains fail-closed when the turn budget is exhausted.\n');

  console.log('✔ ALL 5 HOOKS SYSTEM TESTS PASSED (100% SUCCESS)\n');
}

testHooksSystem().catch((err) => {
  console.error('\n✖ Hooks system test failed:', err);
  process.exit(1);
});
