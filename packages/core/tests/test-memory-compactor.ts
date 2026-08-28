import { MemoryCompactor, EvidenceTracker, ModelMessage } from '../src/index.js';

async function testMemoryCompactor() {
  console.log('=== Running MemoryCompactor Verification Suite ===\n');

  const compactor = new MemoryCompactor({ messageThreshold: 6, recentTurnsToKeep: 2 });
  const evidenceTracker = new EvidenceTracker();

  // Record mock evidence
  evidenceTracker.record(
    'uniprot_lookup',
    'databases',
    'TYK2',
    'Resolved canonical TYK2 (P29597), 1187 aa',
    { primaryAccession: 'P29597' },
    undefined,
    undefined
  );
  evidenceTracker.record(
    'chembl_lookup',
    'databases',
    'TYK2',
    'Found 5 bioactivity measurements',
    { totalRecords: 5 },
    undefined,
    undefined
  );

  // Generate mock conversation history of 10 messages
  const messages: ModelMessage[] = [
    { role: 'system', content: 'You are the Lead Scientific AI Research Partner.' },
    { role: 'user', content: 'Investigate TYK2 signaling and STAT4 in lupus nephritis.' },
    { role: 'assistant', content: 'Hypothesis: TYK2 phosphorylates STAT4. Calling uniprot.' },
    { role: 'tool', name: 'uniprot_lookup', content: '{"primaryAccession":"P29597"}' },
    { role: 'assistant', content: 'Checking inhibitor bioactivities on ChEMBL.' },
    { role: 'tool', name: 'chembl_lookup', content: '{"target_chembl_id":"CHEMBL3553"}' },
    { role: 'assistant', content: 'Checking PubMed for clinical trials.' },
    { role: 'tool', name: 'literature_search', content: '{"totalFound": 8}' },
    { role: 'assistant', content: 'Analyzing latest clinical findings for synthesis.' },
    { role: 'user', content: 'Please proceed with final validation.' },
  ];

  console.log(`[Step 1] Initial Message Count: ${messages.length} messages`);
  const shouldCompact = compactor.shouldCompact(messages);
  console.log(`  ✔ Compactor trigger check: shouldCompact = ${shouldCompact} (Threshold: 6)`);
  if (!shouldCompact) {
    throw new Error('shouldCompact should be true for 10 messages');
  }

  // Execute compaction
  const { compactedMessages, summarizedCount } = compactor.compact(
    messages,
    evidenceTracker,
    'Investigate TYK2 signaling and STAT4 in lupus nephritis.'
  );

  console.log(`\n[Step 2] Compaction Results:`);
  console.log(`  ✔ Compacted earlier steps: ${summarizedCount} messages compressed`);
  console.log(`  ✔ New Total Message Count: ${compactedMessages.length} messages (Reduced from ${messages.length})`);

  // Verify structure
  if (compactedMessages[0].role !== 'system') throw new Error('System prompt lost');
  if (compactedMessages[1].content !== 'Investigate TYK2 signaling and STAT4 in lupus nephritis.') throw new Error('User inquiry lost');
  if (compactedMessages[2].role !== 'system' || !compactedMessages[2].content.includes('Compacted Scientific Working Memory')) {
    throw new Error('Compacted memory snapshot missing');
  }
  if (!compactedMessages[2].content.includes('EV-1') || !compactedMessages[2].content.includes('EV-2')) {
    throw new Error('Evidence records EV-1/EV-2 missing from compacted memory');
  }

  // Verify recent messages preserved
  const lastMsg = compactedMessages[compactedMessages.length - 1];
  if (lastMsg.content !== 'Please proceed with final validation.') {
    throw new Error('Recent user turn was not preserved');
  }

  console.log(`  ✔ Preserved System Prompt + User Inquiry`);
  console.log(`  ✔ Preserved Immutable Evidence Anchors (EV-1, EV-2)`);
  console.log(`  ✔ Preserved Recent Turns Verbatim`);

  console.log('\n✔ MEMORY COMPACTOR TESTS PASSED (100% SUCCESS)\n');
}

testMemoryCompactor().catch((err) => {
  console.error('\n✖ Memory compactor test failed:', err);
  process.exit(1);
});
