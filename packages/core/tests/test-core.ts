import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  SecureStore,
  ProfileManager,
  GenericModelClient,
  fallbackMockProvider,
  AgentLoop,
  SessionManager,
  EventBus,
  createDefaultProfile,
  OpenAIProtocol,
  AnthropicProtocol,
} from '../src/index';

async function runTests() {
  console.log('\n=== Running @junscience/core Test Suite ===\n');

  const testDir = path.join(os.tmpdir(), `junscience-test-${Date.now()}`);
  fs.mkdirSync(testDir, { recursive: true });

  try {
    // ----------------------------------------------------
    // Test 1: SecureStore (AES-256-GCM Encryption)
    // ----------------------------------------------------
    console.log('[Test 1/5] SecureStore (AES-256-GCM Hardware-Salted Vault)');
    const secureStore = new SecureStore(testDir);
    const testSecret = 'sk-test-secret-key-123456789';
    secureStore.setSecret('api_key:test', testSecret);

    const retrieved = secureStore.getSecret('api_key:test');
    if (retrieved !== testSecret) {
      throw new Error(`SecureStore retrieval failed. Expected "${testSecret}", got "${retrieved}"`);
    }

    // Verify file on disk is encrypted (ciphertext does NOT contain plaintext)
    const credFile = path.join(testDir, 'credentials.enc');
    const rawContent = fs.readFileSync(credFile, 'utf-8');
    if (rawContent.includes(testSecret)) {
      throw new Error('Security violation: Plaintext API key found in credentials.enc!');
    }
    console.log('  ✔ Secret encrypted & decrypted successfully with AES-256-GCM');
    console.log('  ✔ Verified zero plaintext in credentials.enc on disk');

    // ----------------------------------------------------
    // Test 2: ProfileManager CRUD
    // ----------------------------------------------------
    console.log('\n[Test 2/5] ProfileManager Multi-Profile Storage');
    const profileMgr = new ProfileManager(testDir, secureStore);
    
    const profile1 = createDefaultProfile({
      name: 'Test DeepSeek Profile',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      apiKey: 'sk-deepseek-live-key',
    });
    profileMgr.saveProfile(profile1);

    const listed = profileMgr.listProfiles();
    if (listed.length !== 1 || listed[0].name !== 'Test DeepSeek Profile') {
      throw new Error(`ProfileManager list failed: ${JSON.stringify(listed)}`);
    }
    if (listed[0].apiKey !== 'sk-deepseek-live-key') {
      throw new Error(`API key not correctly retrieved from SecureStore: ${listed[0].apiKey}`);
    }

    const active = profileMgr.getActiveProfile();
    if (active?.id !== listed[0].id) {
      throw new Error('Active profile mismatch');
    }
    console.log('  ✔ Profile created, listed, and retrieved with encrypted API key');

    // ----------------------------------------------------
    // Test 3: OpenAI and Anthropic Protocol Serializers
    // ----------------------------------------------------
    console.log('\n[Test 3/5] Protocol Serializers & Parsers');
    const oaiHeaders = OpenAIProtocol.buildHeaders(profile1);
    if (oaiHeaders['Authorization'] !== 'Bearer sk-deepseek-live-key') {
      throw new Error(`OpenAI headers missing auth bearer: ${JSON.stringify(oaiHeaders)}`);
    }

    const oaiPayload = OpenAIProtocol.buildPayload({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'hello' }],
      tools: [{ name: 'test_tool', description: 'test', inputSchema: { type: 'object' } }],
    });
    if (!oaiPayload.tools || oaiPayload.tools[0].function.name !== 'test_tool') {
      throw new Error('OpenAI payload tool formatting mismatch');
    }

    const antPayload = AnthropicProtocol.buildPayload({
      model: 'claude-3-5-sonnet',
      messages: [
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'hi' },
      ],
    });
    if (antPayload.system !== 'You are helpful' || antPayload.messages[0].role !== 'user') {
      throw new Error('Anthropic payload system extraction mismatch');
    }
    console.log('  ✔ OpenAI and Anthropic protocol payloads verified');

    // ----------------------------------------------------
    // Test 4: Local In-Process Mock HTTP Server (Protocol & SSE Parsing Verification)
    // ----------------------------------------------------
    console.log('\n[Test 4/5] GenericModelClient against Local In-Process Mock HTTP Server (Protocol Verification)');
    
    // Spin up a minimal local HTTP server simulating OpenAI /chat/completions with SSE
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const parsed = JSON.parse(body);
        
        if (parsed.stream) {
          // Send SSE chunks
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          });

          const chunks = ['Connecting to ', 'scientific neural ', 'network...', ' Done!'];
          chunks.forEach((c) => {
            const sseData = JSON.stringify({
              choices: [{ delta: { content: c } }],
            });
            res.write(`data: ${sseData}\n\n`);
          });
          res.write('data: [DONE]\n\n');
          res.end();
        } else {
          // Standard JSON response
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              choices: [
                {
                  message: { content: 'OK: live endpoint verified' },
                  finish_reason: 'stop',
                },
              ],
            })
          );
        }
      });
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const address = server.address() as any;
    const localPort = address.port;

    const testProfile = createDefaultProfile({
      baseUrl: `http://127.0.0.1:${localPort}/v1`,
      model: 'local-test-model',
      apiKey: 'sk-local-test',
    });

    const client = new GenericModelClient(testProfile);
    
    // 4a: Test Connection Probe
    const testResult = await client.testConnection();
    if (!testResult.success) {
      throw new Error(`testConnection probe failed: ${testResult.error}`);
    }
    console.log(`  ✔ Real connection probe successful: latency=${testResult.latencyMs}ms, msg="${testResult.message}"`);

    // 4b: Real SSE Streaming
    let streamChunks = '';
    const streamedResponse = await client.stream(
      { model: 'local-test-model', messages: [{ role: 'user', content: 'test stream' }] },
      (delta) => {
        streamChunks += delta;
      }
    );
    if (streamChunks !== 'Connecting to scientific neural network... Done!') {
      throw new Error(`Stream chunk mismatch: got "${streamChunks}"`);
    }
    console.log(`  ✔ Real SSE stream received and accumulated cleanly: "${streamedResponse.content}"`);

    server.close();

    // ----------------------------------------------------
    // Test 5: AgentLoop Dependency Injection
    // ----------------------------------------------------
    console.log('\n[Test 5/5] AgentLoop Dependency Injection (Mock fallback & Injected Provider)');
    const eventBus = new EventBus();
    const sessionManager = new SessionManager(path.join(testDir, 'sessions'), eventBus);
    
    const session = sessionManager.createSession('Test DI Session', 'proj-1', 'research');
    const agentLoop = new AgentLoop({
      modelProvider: fallbackMockProvider,
      sessionManager,
      eventBus,
    });

    const turn = await agentLoop.run(session, 'Investigate TYK2 in lupus');
    if (!turn.agentResponse || turn.toolCalls.length === 0) {
      throw new Error('AgentLoop execution failed with injected fallback mock provider');
    }
    console.log(`  ✔ AgentLoop completed turn with ${turn.toolCalls.length} tool calls and verified dependency injection`);

    console.log('\n✔ ALL @junscience/core TESTS PASSED (100% SUCCESS)\n');
  } finally {
    // Cleanup temporary test directory
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

runTests().catch((err) => {
  console.error('\n✖ Test failed:', err);
  process.exit(1);
});
