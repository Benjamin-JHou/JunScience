import { SessionManager } from '../src/core/SessionManager.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

async function runSessionCrudTests() {
  console.log('=== Running JunScience Core Session CRUD Test Suite ===\n');

  const testDir = path.join(os.tmpdir(), `junscience-test-sessions-${Date.now()}`);
  const sm = new SessionManager(testDir);

  // 1. Create Session
  const sess1 = sm.createSession('Target Discovery in MASLD', 'proj-1', 'research', 'prof-1', 'deepseek-chat');
  console.log('[Test 1/5] Create Session');
  console.log(`  ✔ Created session: ${sess1.id} (Title: "${sess1.title}")`);
  if (!sm.getSession(sess1.id)) throw new Error('Session not found after creation');

  // 2. Add Turn and Artifact
  sm.addTurn(sess1.id, {
    index: 1,
    userInput: 'Analyze PNPLA3 I148M mutation in hepatic steatosis',
    agentResponse: 'PNPLA3 I148M (rs738409) promotes liver fat accumulation by impairing triacylglycerol hydrolysis.',
    toolCalls: [],
    toolResults: [{
      callId: 'call-1',
      name: 'uniprot_kb',
      output: { gene: 'PNPLA3', variant: 'I148M' },
      execution: {
        id: 'exec-1',
        toolName: 'uniprot_kb',
        category: 'databases',
        description: 'Query UniProt for PNPLA3',
        status: 'completed',
        logs: ['Fetched Q9NST1'],
        duration: '0.4s',
        resultSummary: 'Found PNPLA3 (1187 aa)',
      },
    }],
    status: 'completed',
    startedAt: new Date().toISOString(),
  });

  sm.addArtifact(sess1.id, {
    id: 'art-1',
    title: 'PNPLA3_Volcano_Plot.png',
    type: 'figure',
    description: 'High-resolution volcano plot of differential hepatic genes',
  });

  console.log('[Test 2/5] Record Turns & Artifacts');
  console.log(`  ✔ Turn and artifact added to ${sess1.id}`);

  // 3. Rename Session
  console.log('[Test 3/5] Rename Session');
  const renamed = sm.renameSession(sess1.id, 'MASLD Hepatic Transcriptomics & PNPLA3');
  const updatedSess = sm.getSession(sess1.id);
  if (!renamed || updatedSess?.title !== 'MASLD Hepatic Transcriptomics & PNPLA3') {
    throw new Error('Rename failed');
  }
  console.log(`  ✔ Renamed title to "${updatedSess.title}"`);

  // 4. Export Markdown Report
  console.log('[Test 4/5] Export Markdown Report');
  const mdReport = sm.exportSessionMarkdown(sess1.id);
  if (!mdReport.includes('JunScience Research Report') || !mdReport.includes('PNPLA3_Volcano_Plot.png')) {
    throw new Error('Markdown export missing key details');
  }
  console.log(`  ✔ Exported Markdown report (${mdReport.length} chars)`);

  // 5. Delete Session
  console.log('[Test 5/5] Delete Session');
  const deleted = sm.deleteSession(sess1.id);
  if (!deleted || sm.getSession(sess1.id)) {
    throw new Error('Session delete failed');
  }
  console.log(`  ✔ Successfully deleted session ${sess1.id}`);

  // Cleanup test directory
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n✔ ALL 5 SESSION CRUD TESTS PASSED (100% SUCCESS)\n');
}

runSessionCrudTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
