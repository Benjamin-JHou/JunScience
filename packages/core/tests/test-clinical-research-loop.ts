import {
  AutonomousResearchEngine,
  EvidenceTracker,
  ScientificMockProvider,
  ClinicalTrialsTool,
  OpenFDATool,
  RxNormTool,
  DailyMedTool,
  MedlinePlusTool,
  SessionManager,
  ToolContext,
} from '../src/index.js';

async function testClinicalResearchLoop() {
  console.log('=== Running Pure Clinical Inquiry through AutonomousResearchEngine ===\n');

  const inquiry = '评估已上市 TYK2 抑制剂德克伐替尼（Deucravacitinib / Sotyktu）在斑块状银屑病与红斑狼疮中的真实世界不良反应信号（openFDA FAERS）、官方说明书黑框警告与禁忌（DailyMed）、标准规范 RxCUI（RxNorm）以及当前活跃临床试验终点（ClinicalTrials.gov），评估其安全性与临床证据充分性。';
  console.log(`[Clinical Inquiry]: "${inquiry}"\n`);

  const mockProvider = new ScientificMockProvider();
  const sessionManager = new SessionManager();
  const session = sessionManager.createSession('Clinical Deucravacitinib Safety Study', 'research');

  const engine = new AutonomousResearchEngine({
    modelProvider: mockProvider,
    sessionManager,
    maxTurns: 8,
  });

  const dummyContext: ToolContext = {
    sessionId: session.id,
    agentId: 'research',
    turnIndex: 0,
    reportProgress: (log: string) => console.log(`  [Progress] ${log}`),
  };

  console.log('[Phase 1: Dynamic Clinical Tool Calling & Evidence Ingestion]');
  
  // 1. openFDA
  const fdaRes = await OpenFDATool.execute({ drugName: 'Deucravacitinib', queryType: 'both' }, dummyContext);
  if (!fdaRes.success) throw new Error('OpenFDATool failed in clinical loop test');

  // 2. ClinicalTrials.gov
  const ctRes = await ClinicalTrialsTool.execute({ condition: 'Systemic Lupus Erythematosus', interventionOrDrug: 'Deucravacitinib', limit: 2 }, dummyContext);
  if (!ctRes.success) throw new Error('ClinicalTrialsTool failed in clinical loop test');

  // 3. RxNorm
  const rxRes = await RxNormTool.execute({ drugNameOrRxCUI: 'Deucravacitinib' }, dummyContext);
  if (!rxRes.success) throw new Error('RxNormTool failed in clinical loop test');

  // 4. DailyMed
  const dailyRes = await DailyMedTool.execute({ drugName: 'Deucravacitinib' }, dummyContext);
  if (!dailyRes.success) throw new Error('DailyMedTool failed in clinical loop test');

  // 5. MedlinePlus
  const medlineRes = await MedlinePlusTool.execute({ topicOrCondition: 'Psoriasis' }, dummyContext);
  if (!medlineRes.success) throw new Error('MedlinePlusTool failed in clinical loop test');

  console.log('\n[Phase 2: Autonomous ReAct Turn Execution via AutonomousResearchEngine]');
  const turn = await engine.run(session, inquiry, (delta) => {});

  console.log(`  ✔ Final Turn Status: ${turn.status}`);
  console.log(`  ✔ Turn Tool Calls Count: ${turn.toolCalls.length}`);
  console.log(`  ✔ Turn Tool Results Count: ${turn.toolResults.length}`);
  console.log(`  ✔ Agent Synthesis Response: "${turn.agentResponse.slice(0, 100)}..."`);

  if (!turn.agentResponse || turn.status !== 'completed') {
    throw new Error('AutonomousResearchEngine clinical turn execution failed');
  }

  console.log('\n✔ PURE CLINICAL RESEARCH REASONING LOOP VALIDATED (100% SUCCESS)\n');
}

testClinicalResearchLoop().catch((err) => {
  console.error('\n✖ Clinical research loop test failed:', err);
  process.exit(1);
});
