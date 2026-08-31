import {
  SubagentTreeEngine,
  HypothesisNode,
  EvidenceTracker,
} from '../src/index.js';

async function testSubagentTree() {
  console.log('=== Running Subagent Tree Multi-Hypothesis Confidence Differentiation Suite ===\n');

  const engine = new SubagentTreeEngine();
  const parentTracker = new EvidenceTracker();

  // 3 Hypotheses with strictly distinct empirical evidence profiles:
  const hypotheses: HypothesisNode[] = [
    {
      id: 'hyp-1',
      title: 'TYK2 Allosteric Pseudokinase Nanomolar Potency',
      statement: 'Deucravacitinib demonstrates high-affinity sub-50 nM allosteric binding to TYK2 JH2 domain.',
      targetEntity: 'TYK2',
      status: 'pending',
      confidenceScore: 0.0,
      evidenceIds: [],
    },
    {
      id: 'hyp-2',
      title: 'JAK1 Catalytic Pocket Off-Target Cross-Reactivity',
      statement: 'JAK1 exhibits partial sequence conservation but lacks high-affinity allosteric pocket binding.',
      targetEntity: 'JAK1',
      status: 'pending',
      confidenceScore: 0.0,
      evidenceIds: [],
    },
    {
      id: 'hyp-3',
      title: 'EGFR Unrelated Kinase Direct Inhibition (Negative Control)',
      statement: 'Deucravacitinib acts as a direct nanomolar catalytic pocket inhibitor of EGFR kinase.',
      targetEntity: 'EGFR_Unrelated_Negative_Control',
      status: 'pending',
      confidenceScore: 0.0,
      evidenceIds: [],
    },
  ];

  console.log(`[Phase 1: Forking Subagent Tree with ${hypotheses.length} Distinct Parallel Hypothesis Branches]`);

  const { hypothesisTree, branchResults, comparisonMatrix } = await engine.exploreHypothesesParallel(
    `sub-test-${Date.now()}`,
    hypotheses,
    parentTracker,
    3,
    (branchName, log) => console.log(`  [${branchName}] ${log}`)
  );

  console.log(`\n[Phase 2: Consolidated Evidence Tree (${parentTracker.count()} Total Evidence Records)]`);
  for (const ev of parentTracker.list()) {
    console.log(`  ✔ [${ev.id}] (${ev.toolName}) ${ev.summary}`);
  }

  console.log('\n[Phase 3: Multi-Hypothesis Comparative Evaluation Matrix]');
  console.log(comparisonMatrix);

  if (branchResults.length !== 3) {
    throw new Error(`Expected 3 branch results, got ${branchResults.length}`);
  }

  const tyk2Node = hypothesisTree.getHypothesis('hyp-1');
  const jak1Node = hypothesisTree.getHypothesis('hyp-2');
  const egfrNode = hypothesisTree.getHypothesis('hyp-3');

  console.log('\n[Phase 4: Statistical Differentiation Verification]');
  console.log(`  • HYP-1 (TYK2): Status = ${tyk2Node?.status}, Confidence = ${(Number(tyk2Node?.confidenceScore) * 100).toFixed(0)}%`);
  console.log(`  • HYP-2 (JAK1): Status = ${jak1Node?.status}, Confidence = ${(Number(jak1Node?.confidenceScore) * 100).toFixed(0)}%`);
  console.log(`  • HYP-3 (EGFR Negative Control): Status = ${egfrNode?.status}, Confidence = ${(Number(egfrNode?.confidenceScore) * 100).toFixed(0)}%`);

  // Verify non-identical confidences and proper status classifications
  if (!tyk2Node || tyk2Node.status !== 'supported' || tyk2Node.confidenceScore < 0.70) {
    throw new Error(`HYP-1 expected supported (>=70%), got ${tyk2Node?.status} with ${tyk2Node?.confidenceScore}`);
  }

  if (!jak1Node || (jak1Node.status !== 'inconclusive' && jak1Node.status !== 'supported') || jak1Node.confidenceScore >= tyk2Node.confidenceScore) {
    throw new Error(`HYP-2 confidence (${jak1Node?.confidenceScore}) should be lower than HYP-1 (${tyk2Node.confidenceScore})`);
  }

  if (!egfrNode || egfrNode.status !== 'refuted' || egfrNode.confidenceScore > 0.30) {
    throw new Error(`HYP-3 expected refuted (<=30%), got ${egfrNode?.status} with ${egfrNode?.confidenceScore}`);
  }

  // [Phase 5: Network Error vs Genuine Scientific Refutation Distinction Test]
  console.log('\n[Phase 5: Network & Tool Outage Distinction Verification (BUG-06 Fix)]');
  const brokenToolRegistry: any = {
    get: () => true,
    execute: async () => ({
      success: false,
      error: 'FetchError: connect ETIMEDOUT 128.175.241.13:443 (Simulated Network Disconnection)',
    }),
  };

  const offlineEngine = new SubagentTreeEngine(brokenToolRegistry);
  const offlineTracker = new EvidenceTracker();
  const testOfflineHypotheses: HypothesisNode[] = [
    {
      id: 'hyp-offline',
      title: 'Valid Target under Network Outage',
      statement: 'TYK2 demonstrates high-affinity binding.',
      targetEntity: 'TYK2',
      status: 'pending',
      confidenceScore: 0.0,
      evidenceIds: [],
    },
  ];

  const offlineRes = await offlineEngine.exploreHypothesesParallel(
    `offline-test-${Date.now()}`,
    testOfflineHypotheses,
    offlineTracker,
    1
  );

  const offlineNode = offlineRes.hypothesisTree.getHypothesis('hyp-offline');
  console.log(`  • Network Failure Node Status: "${offlineNode?.status}"`);
  console.log(`  • Findings: "${offlineNode?.findingsSummary}"`);

  if (offlineNode?.status === 'refuted') {
    throw new Error(`CRITICAL BUG-06 FAILURE: Network failure was falsely classified as "refuted"! Must be "error".`);
  }
  if (offlineNode?.status !== 'error') {
    throw new Error(`Expected status "error" on network outage, got "${offlineNode?.status}"`);
  }
  if (!offlineNode?.findingsSummary?.includes('communication/tool failure')) {
    throw new Error(`Findings must clarify communication failure.`);
  }
  console.log('  ✔ Network failure correctly marked as "error" with zero false-refutations.');

  console.log('\n✔ ALL SUBAGENT TREE CONFIDENCE DIFFERENTIATION & NETWORK ERROR TESTS PASSED (100% SUCCESS)\n');
}

testSubagentTree().catch((err) => {
  console.error('\n✖ Subagent tree test failed:', err);
  process.exit(1);
});
