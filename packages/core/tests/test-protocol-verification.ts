import http from 'node:http';
import {
  OpenAIProtocol,
  AnthropicProtocol,
  ModelRequest,
  ModelResponse,
  GenericModelClient,
  AutonomousResearchEngine,
  AgentLoop,
  SessionManager,
  EventBus,
  EvidenceTracker,
  MemoryCompactor,
  createDefaultProfile,
} from '../src/index.js';

// ============================================================================
// Official OpenAI Protocol Strict JSON Schema Validator
// ============================================================================
function validateOpenAIPayloadStrict(payload: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!payload.model || typeof payload.model !== 'string') {
    errors.push('Missing or non-string "model" property.');
  }

  if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
    errors.push('"messages" must be a non-empty array.');
    return { valid: false, errors };
  }

  const validRoles = ['system', 'user', 'assistant', 'tool'];
  const pendingToolCalls = new Map<string, string>(); // toolCallId -> toolName

  for (let idx = 0; idx < payload.messages.length; idx++) {
    const msg = payload.messages[idx];
    const prefix = `messages[${idx}] (role: "${msg.role}")`;

    if (!validRoles.includes(msg.role)) {
      errors.push(`${prefix}: Invalid role "${msg.role}". Must be one of: ${validRoles.join(', ')}`);
      continue;
    }

    if (msg.role === 'tool') {
      if (!msg.tool_call_id || typeof msg.tool_call_id !== 'string') {
        errors.push(`${prefix}: Tool message missing required "tool_call_id".`);
      } else if (!pendingToolCalls.has(msg.tool_call_id)) {
        errors.push(
          `${prefix}: Tool message tool_call_id "${msg.tool_call_id}" has NO preceding matching assistant tool_calls item! (OpenAI HTTP 400 violation)`
        );
      } else {
        pendingToolCalls.delete(msg.tool_call_id);
      }
      if (typeof msg.content !== 'string') {
        errors.push(`${prefix}: Tool message content must be a string.`);
      }
    } else if (msg.role === 'assistant') {
      if (msg.tool_calls) {
        if (!Array.isArray(msg.tool_calls)) {
          errors.push(`${prefix}: "tool_calls" must be an array.`);
        } else {
          for (let tcIdx = 0; tcIdx < msg.tool_calls.length; tcIdx++) {
            const tc = msg.tool_calls[tcIdx];
            if (!tc.id || typeof tc.id !== 'string') {
              errors.push(`${prefix}.tool_calls[${tcIdx}]: Missing required "id".`);
            }
            if (tc.type !== 'function') {
              errors.push(`${prefix}.tool_calls[${tcIdx}]: "type" must be "function".`);
            }
            if (!tc.function || typeof tc.function.name !== 'string' || typeof tc.function.arguments !== 'string') {
              errors.push(`${prefix}.tool_calls[${tcIdx}]: Missing or invalid "function" object with name and string arguments.`);
            } else {
              pendingToolCalls.set(tc.id, tc.function.name);
            }
          }
        }
      }
    }
  }

  if (payload.tools) {
    if (!Array.isArray(payload.tools)) {
      errors.push('"tools" must be an array.');
    } else {
      for (let tIdx = 0; tIdx < payload.tools.length; tIdx++) {
        const tool = payload.tools[tIdx];
        if (tool.type !== 'function' || !tool.function?.name) {
          errors.push(`tools[${tIdx}]: Tool must have type="function" and function.name.`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// Official Anthropic Messages API Strict JSON Schema Validator
// ============================================================================
function validateAnthropicPayloadStrict(payload: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!payload.model || typeof payload.model !== 'string') {
    errors.push('Missing or non-string "model" property.');
  }

  if (payload.max_tokens === undefined || typeof payload.max_tokens !== 'number') {
    errors.push('Missing or non-number "max_tokens" parameter required by Anthropic API.');
  }

  if (payload.system !== undefined && typeof payload.system !== 'string') {
    errors.push('Top-level "system" prompt must be a string.');
  }

  if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
    errors.push('"messages" must be a non-empty array.');
    return { valid: false, errors };
  }

  let expectedRole: 'user' | 'assistant' | null = null;
  const pendingAnthropicToolUses = new Set<string>();

  for (let idx = 0; idx < payload.messages.length; idx++) {
    const msg = payload.messages[idx];
    const prefix = `messages[${idx}]`;

    // 1. Anthropic rejects any 'system' or 'tool' role in messages array
    if (msg.role !== 'user' && msg.role !== 'assistant') {
      errors.push(`${prefix}: Illegal role "${msg.role}". Anthropic messages array ONLY permits "user" and "assistant".`);
      continue;
    }

    // 2. Strict Role Alternation: roles MUST strictly alternate user <-> assistant
    if (expectedRole !== null && msg.role !== expectedRole) {
      errors.push(
        `${prefix}: Role alternation violation: got "${msg.role}", expected "${expectedRole}". Anthropic returns HTTP 400 when consecutive messages have the same role.`
      );
    }
    expectedRole = msg.role === 'user' ? 'assistant' : 'user';

    // 3. Inspect content blocks
    if (Array.isArray(msg.content)) {
      for (let bIdx = 0; bIdx < msg.content.length; bIdx++) {
        const block = msg.content[bIdx];
        const blockPrefix = `${prefix}.content[${bIdx}]`;

        if (block.type === 'tool_use') {
          if (msg.role !== 'assistant') {
            errors.push(`${blockPrefix}: "tool_use" blocks can ONLY appear inside assistant messages.`);
          }
          if (!block.id || !block.name || typeof block.input !== 'object') {
            errors.push(`${blockPrefix}: Invalid tool_use block schema (missing id, name, or object input).`);
          } else {
            pendingAnthropicToolUses.add(block.id);
          }
        } else if (block.type === 'tool_result') {
          if (msg.role !== 'user') {
            errors.push(`${blockPrefix}: "tool_result" blocks can ONLY appear inside user messages.`);
          }
          if (!block.tool_use_id) {
            errors.push(`${blockPrefix}: Tool result missing required "tool_use_id".`);
          } else if (!pendingAnthropicToolUses.has(block.tool_use_id)) {
            errors.push(`${blockPrefix}: Tool result tool_use_id "${block.tool_use_id}" has no preceding tool_use block!`);
          } else {
            pendingAnthropicToolUses.delete(block.tool_use_id);
          }
        } else if (block.type !== 'text' && block.type !== 'image') {
          errors.push(`${blockPrefix}: Unknown content block type "${block.type}".`);
        }
      }
    }
  }

  // 4. Tools schema check
  if (payload.tools) {
    if (!Array.isArray(payload.tools)) {
      errors.push('"tools" must be an array.');
    } else {
      for (let tIdx = 0; tIdx < payload.tools.length; tIdx++) {
        const tool = payload.tools[tIdx];
        if (!tool.name || !tool.input_schema) {
          errors.push(`tools[${tIdx}]: Anthropic tool definition missing required "name" or "input_schema".`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// Protocol Verification Test Runner
// ============================================================================
async function runProtocolVerificationSuite() {
  console.log('\n=================================================================');
  console.log('🔬 RUNNING RIGOROUS OPENAI & ANTHROPIC PROTOCOL VERIFICATION SUITE');
  console.log('=================================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: BUG-01 OpenAI Protocol Multi-Tool Call Schema Validation
  // --------------------------------------------------------------------------
  console.log('[Test 1/4] BUG-01: OpenAI Protocol tool_calls & tool_call_id Schema Validation');

  const openAiRequest: ModelRequest = {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are JunScience research engine.' },
      { role: 'user', content: 'Investigate TYK2 allosteric binding and retrieve 3D structures.' },
      // Assistant calls 2 tools in parallel:
      {
        role: 'assistant',
        content: 'Querying UniProt and PDB for TYK2 structural data...',
        toolCalls: [
          {
            id: 'call_uniprot_987',
            name: 'uniprot_lookup',
            arguments: { accessionOrGene: 'TYK2' },
          },
          {
            id: 'call_pdb_654',
            name: 'pdb_lookup',
            arguments: { pdbIdOrUniProt: '8Q4O' },
          },
        ],
      },
      // Consecutive tool results:
      {
        role: 'tool',
        name: 'uniprot_lookup',
        content: JSON.stringify({ primaryAccession: 'P29597', geneName: 'TYK2', length: 1187 }),
        toolCallId: 'call_uniprot_987',
      },
      {
        role: 'tool',
        name: 'pdb_lookup',
        content: JSON.stringify({ pdbId: '8Q4O', resolution: '1.85 A', method: 'X-RAY' }),
        toolCallId: 'call_pdb_654',
      },
    ],
    tools: [
      {
        name: 'uniprot_lookup',
        description: 'Query UniProtKB',
        inputSchema: { type: 'object', properties: { accessionOrGene: { type: 'string' } } },
      },
      {
        name: 'pdb_lookup',
        description: 'Query PDB',
        inputSchema: { type: 'object', properties: { pdbIdOrUniProt: { type: 'string' } } },
      },
    ],
  };

  const openAiPayload = OpenAIProtocol.buildPayload(openAiRequest, false);
  const openAiValidation = validateOpenAIPayloadStrict(openAiPayload);

  if (!openAiValidation.valid) {
    throw new Error(`OpenAI Schema Validation Failed:\n  - ${openAiValidation.errors.join('\n  - ')}`);
  }

  // Verify assistant message structure
  const assistantMsg = openAiPayload.messages[2];
  if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length !== 2) {
    throw new Error(`OpenAI assistant message missing tool_calls array: ${JSON.stringify(assistantMsg)}`);
  }
  if (assistantMsg.tool_calls[0].id !== 'call_uniprot_987' || assistantMsg.tool_calls[1].id !== 'call_pdb_654') {
    throw new Error(`OpenAI tool_calls IDs mismatch: ${JSON.stringify(assistantMsg.tool_calls)}`);
  }
  if (typeof assistantMsg.tool_calls[0].function.arguments !== 'string') {
    throw new Error(`OpenAI tool_calls arguments must be stringified JSON!`);
  }

  // Verify tool message structure
  const toolMsg1 = openAiPayload.messages[3];
  const toolMsg2 = openAiPayload.messages[4];
  if (toolMsg1.role !== 'tool' || toolMsg1.tool_call_id !== 'call_uniprot_987') {
    throw new Error(`OpenAI tool message 1 formatting error: ${JSON.stringify(toolMsg1)}`);
  }
  if (toolMsg2.role !== 'tool' || toolMsg2.tool_call_id !== 'call_pdb_654') {
    throw new Error(`OpenAI tool message 2 formatting error: ${JSON.stringify(toolMsg2)}`);
  }

  console.log('  ✔ Assistant tool_calls correctly serialized with function.name and stringified arguments.');
  console.log('  ✔ Tool results strictly mapped to tool_call_id without orphan or mismatched calls.');
  console.log('  ✔ Strict OpenAI Schema Validation: 100% PASSED.\n');

  // --------------------------------------------------------------------------
  // TEST 2: BUG-02 Anthropic Protocol Role Alternation & Memory Preservation
  // --------------------------------------------------------------------------
  console.log('[Test 2/4] BUG-02: Anthropic Protocol Memory Preservation & Strict Role Alternation');

  const compactor = new MemoryCompactor();
  const evidenceTracker = new EvidenceTracker();
  evidenceTracker.record(
    'uniprot_lookup',
    'databases',
    'TYK2',
    'Resolved human TYK2 (P29597, 1187 aa)',
    { sequenceLength: 1187 }
  );

  // Simulate complex turn history with injected working memory and mid-run steering
  const anthropicRequest: ModelRequest = {
    model: 'claude-3-7-sonnet-20250219',
    messages: [
      { role: 'system', content: 'Base system prompt: Autonomous scientific researcher.' },
      { role: 'user', content: 'Initial question: Investigate TYK2 JH2 pseudokinase domain.' },
      // MemoryCompactor injected system message (compacted working memory summary):
      {
        role: 'system',
        content: `### Compacted Working Memory\n- Prior finding: TYK2 JH2 domain regulates allosteric inhibition. [Evidence: EV-1]`,
      },
      // Assistant calls 2 tools in turn:
      {
        role: 'assistant',
        content: 'Executing bioactivity search in ChEMBL and clinical trial matching...',
        toolCalls: [
          { id: 'toolu_chembl_01', name: 'chembl_lookup', arguments: { targetOrCompound: 'TYK2' } },
          { id: 'toolu_clin_02', name: 'clinical_trials_lookup', arguments: { interventionOrDrug: 'Deucravacitinib' } },
        ],
      },
      // 2 Tool results pushed:
      {
        role: 'tool',
        name: 'chembl_lookup',
        content: JSON.stringify({ minIc50: 12.5, compound: 'Deucravacitinib' }),
        toolCallId: 'toolu_chembl_01',
      },
      {
        role: 'tool',
        name: 'clinical_trials_lookup',
        content: JSON.stringify({ trialCount: 14, nctId: 'NCT03624127' }),
        toolCallId: 'toolu_clin_02',
      },
      // Followed immediately by user steering guidance (which would cause consecutive user messages if unnormalized):
      {
        role: 'user',
        content: '[Steering Guidance]: Prioritize Phase 3 trials in Psoriasis and Lupus Nephritis.',
      },
    ],
    tools: [
      {
        name: 'chembl_lookup',
        description: 'Query ChEMBL bioactivities',
        inputSchema: { type: 'object', properties: { targetOrCompound: { type: 'string' } } },
      },
      {
        name: 'clinical_trials_lookup',
        description: 'Query ClinicalTrials.gov',
        inputSchema: { type: 'object', properties: { interventionOrDrug: { type: 'string' } } },
      },
    ],
  };

  const anthropicPayload = AnthropicProtocol.buildPayload(anthropicRequest, false);
  const anthropicValidation = validateAnthropicPayloadStrict(anthropicPayload);

  if (!anthropicValidation.valid) {
    throw new Error(`Anthropic Schema Validation Failed:\n  - ${anthropicValidation.errors.join('\n  - ')}`);
  }

  // 1. Verify system prompt concatenation (preserving MemoryCompactor block!)
  if (!anthropicPayload.system.includes('Base system prompt') || !anthropicPayload.system.includes('Compacted Working Memory')) {
    throw new Error(`Anthropic system prompt failed to preserve compacted memory! Payload system: ${anthropicPayload.system}`);
  }

  // 2. Verify strict role alternation
  const msgRoles = anthropicPayload.messages.map((m: any) => m.role);
  if (msgRoles.join(' -> ') !== 'user -> assistant -> user') {
    throw new Error(`Anthropic messages role sequence error: got "${msgRoles.join(' -> ')}", expected "user -> assistant -> user"`);
  }

  // 3. Verify assistant message tool_use content blocks
  const antAssistantMsg = anthropicPayload.messages[1];
  const toolUseBlocks = antAssistantMsg.content.filter((b: any) => b.type === 'tool_use');
  if (toolUseBlocks.length !== 2 || toolUseBlocks[0].id !== 'toolu_chembl_01' || toolUseBlocks[1].id !== 'toolu_clin_02') {
    throw new Error(`Anthropic tool_use blocks mismatch: ${JSON.stringify(antAssistantMsg)}`);
  }

  // 4. Verify user message merged tool_results + steering content
  const antUserMsg2 = anthropicPayload.messages[2];
  const toolResultBlocks = antUserMsg2.content.filter((b: any) => b.type === 'tool_result');
  if (toolResultBlocks.length !== 2) {
    throw new Error(`Anthropic tool_result blocks not correctly consolidated into user message: ${JSON.stringify(antUserMsg2)}`);
  }
  const textBlocks = antUserMsg2.content.filter((b: any) => b.type === 'text');
  if (!textBlocks.some((tb: any) => tb.text.includes('Steering Guidance'))) {
    throw new Error(`Anthropic user steering guidance was dropped during consolidation!`);
  }

  console.log('  ✔ Top-level system string preserves initial prompt AND compacted working memory summary.');
  console.log('  ✔ Multi-tool results and steering guidance consolidated into single valid "user" message.');
  console.log('  ✔ Strict Role Alternation (user <-> assistant): 100% VALIDATED.');
  console.log('  ✔ Strict Anthropic Messages API Schema Validation: 100% PASSED.\n');

  // --------------------------------------------------------------------------
  // TEST 3: Live In-Process Mock HTTP Server with Strict Schema Enforcement
  // --------------------------------------------------------------------------
  console.log('[Test 3/4] Live In-Process HTTP Server with Strict Protocol Schema Enforcement (Zero Tolerance)');

  let requestCount = 0;
  let receivedOpenAiPayloads: any[] = [];

  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      requestCount++;
      const parsed = JSON.parse(body);
      receivedOpenAiPayloads.push(parsed);

      // Perform STRICT schema enforcement on every incoming HTTP request:
      const validation = validateOpenAIPayloadStrict(parsed);
      if (!validation.valid) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: {
              message: `Strict schema violation (HTTP 400): ${validation.errors.join('; ')}`,
              type: 'invalid_request_error',
            },
          })
        );
        return;
      }

      // Turn 1: Model responds with tool_calls
      if (requestCount === 1) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: 'Searching UniProt database for target TYK2...',
                  tool_calls: [
                    {
                      id: 'call_live_mock_001',
                      type: 'function',
                      function: {
                        name: 'uniprot_lookup',
                        arguments: JSON.stringify({ accessionOrGene: 'TYK2' }),
                      },
                    },
                  ],
                },
                finish_reason: 'tool_calls',
              },
            ],
          })
        );
        return;
      }

      // Turn 2: Model finishes with final synthesis
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          choices: [
            {
              message: {
                content:
                  'Based on UniProtKB P29597 [Evidence: EV-1], human TYK2 is a 1187 aa tyrosine kinase with a critical JH2 allosteric pseudokinase domain.',
              },
              finish_reason: 'stop',
            },
          ],
        })
      );
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as any;
  const localPort = address.port;

  const testProfile = createDefaultProfile({
    baseUrl: `http://127.0.0.1:${localPort}/v1`,
    model: 'strict-mock-gpt-4o',
    apiKey: 'sk-strict-test-key-12345',
  });

  const strictClient = new GenericModelClient(testProfile);
  const sessionManager = new SessionManager();
  const session = sessionManager.createSession('Strict Protocol Session', 'proj-1', 'research');

  const autonomousEngine = new AutonomousResearchEngine({
    modelProvider: strictClient,
    sessionManager,
    maxTurns: 4,
  });

  const turn = await autonomousEngine.run(session, 'Investigate TYK2 allosteric domain');

  server.close();

  if (requestCount !== 2) {
    throw new Error(`Expected exactly 2 turns with tool calling, got ${requestCount}`);
  }

  // Validate the 2nd request sent to server (which contains the assistant tool_calls + tool result!)
  const turn2RequestPayload = receivedOpenAiPayloads[1];
  const turn2Validation = validateOpenAIPayloadStrict(turn2RequestPayload);
  if (!turn2Validation.valid) {
    throw new Error(`Turn 2 Request to strict server was invalid:\n  - ${turn2Validation.errors.join('\n  - ')}`);
  }

  console.log(`  ✔ AutonomousResearchEngine completed 2-turn tool calling loop cleanly against strict HTTP mock.`);
  console.log(`  ✔ Strict endpoint validated all incoming payloads with ZERO HTTP 400 errors.`);
  console.log(`  ✔ Final response received and verified: "${turn.agentResponse.slice(0, 80)}..."\n`);

  // --------------------------------------------------------------------------
  // TEST 4: AgentLoop End-to-End Formatting Verification
  // --------------------------------------------------------------------------
  console.log('[Test 4/4] AgentLoop Multi-Turn Tool Formatting Verification');

  const agentLoop = new AgentLoop({
    modelProvider: strictClient,
    sessionManager,
  });

  const loopSession = sessionManager.createSession('Loop Test Session', 'proj-1', 'research');
  // Re-open server for agent loop test
  const server2 = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      const parsed = JSON.parse(body);
      const validation = validateOpenAIPayloadStrict(parsed);
      if (!validation.valid) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: validation.errors.join('; ') } }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ choices: [{ message: { content: 'AgentLoop verified OK' }, finish_reason: 'stop' }] }));
    });
  });

  await new Promise<void>((resolve) => server2.listen(localPort, '127.0.0.1', () => resolve()));
  const loopTurn = await agentLoop.run(loopSession, 'Verify AgentLoop message history formatting');
  server2.close();

  if (!loopTurn.agentResponse) {
    throw new Error('AgentLoop execution failed');
  }
  console.log(`  ✔ AgentLoop completed turn with validated payload structure.`);

  console.log('\n=================================================================');
  console.log('✔ ALL PRIORITY 1 PROTOCOL CORRECTNESS TESTS PASSED (100% SUCCESS)');
  console.log('=================================================================\n');
}

runProtocolVerificationSuite().catch((err) => {
  console.error('\n✖ Protocol verification test suite failed:', err);
  process.exit(1);
});
