import {
  SubagentTreeEngine,
  HypothesisNode,
  EvidenceTracker,
} from '../src/index.js';

async function testSubagentTree() {
  console.log('=== Running DeepSeek Harness-Style Subagent Tree Verification Suite ===\n');

  const engine = new SubagentTreeEngine();
  const parentTracker = new EvidenceTracker();

  const hypotheses: HypothesisNode[] = [
    {
      id: 'hyp-1',
      title: 'TYK2 Allosteric Pseudokinase Target Profiling',
      statement: 'Deucravacitinib selectively targets the JH2 pseudokinase domain of TYK2 over other JAK family members.',
      targetEntity: 'TYK2',
      status: 'pending',
      confidenceScore: 0.0,
      evidenceIds: [],
    },
    {
      id: 'hyp-2',
      title: 'JAK1 Catalytic Pocket Off-Target Risk',
      statement: 'JAK1 possesses high active-site sequence conservation with potential orthosteric cross-reactivity.',
      targetEntity: 'JAK1',
      status: 'pending',
      confidenceScore: 0.0,
      evidenceIds: [],
    },
    {
      id: 'hyp-3',
      title: 'JAK2 Hematopoietic Toxicity Profiling',
      statement: 'Lack of JAK2 JH2 pseudokinase binding protects against erythropoietin signaling inhibition and cytopenia.',
      targetEntity: 'JAK2',
      status: 'pending',
      confidenceScore: 0.0,
      evidenceIds: [],
    },
  ];

  console.log(`[Phase 1: Forking Subagent Tree with ${hypotheses.length} Parallel Hypothesis Branches]`);

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
  if (!tyk2Node || tyk2Node.status !== 'supported' || tyk2Node.evidenceIds.length === 0) {
    throw new Error('Subagent Tree TYK2 branch hypothesis evaluation failed');
  }

  console.log('✔ ALL SUBAGENT TREE & HYPOTHESIS FORKING TESTS PASSED (100% SUCCESS)\n');
}

testSubagentTree().catch((err) => {
  console.error('\n✖ Subagent tree test failed:', err);
  process.exit(1);
});
