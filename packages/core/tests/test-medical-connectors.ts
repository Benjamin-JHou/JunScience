import {
  ClinicalTrialsTool,
  OpenFDATool,
  RxNormTool,
  DailyMedTool,
  MedlinePlusTool,
  CritiqueEngine,
  ToolContext,
} from '../src/index.js';

const dummyContext: ToolContext = {
  sessionId: `test-med-${Date.now()}`,
  agentId: 'research',
  turnIndex: 0,
  reportProgress: (log: string) => {},
};

async function testMedicalConnectors() {
  console.log('=== Running Live Medical & Clinical Tools Test Suite ===\n');

  // Test 1: ClinicalTrials.gov API v2
  console.log('[Test 1/6] Live ClinicalTrialsTool (ClinicalTrials.gov API v2)');
  const ctRes = await ClinicalTrialsTool.execute(
    { condition: 'Systemic Lupus Erythematosus', interventionOrDrug: 'Deucravacitinib', limit: 2 },
    dummyContext
  );
  if (!ctRes.success || !ctRes.output.trials || ctRes.output.trials.length === 0) {
    throw new Error(`ClinicalTrialsTool failed: ${JSON.stringify(ctRes)}`);
  }
  const topTrial = ctRes.output.trials[0];
  console.log(`  ✔ Found ${ctRes.output.trials.length} trials (Top: [${topTrial.nctId}] ${topTrial.title.slice(0, 50)}... - ${topTrial.phases}, ${topTrial.status})`);

  // Direct NCT lookup
  const directNctRes = await ClinicalTrialsTool.execute({ nctId: topTrial.nctId }, dummyContext);
  if (!directNctRes.success || directNctRes.output.trials[0].nctId !== topTrial.nctId) {
    throw new Error(`Direct NCT lookup failed for ${topTrial.nctId}`);
  }
  console.log(`  ✔ Direct NCT verification succeeded for ${topTrial.nctId}`);

  // Test 2: openFDA Drug Labels & FAERS
  console.log('\n[Test 2/6] Live OpenFDATool (openFDA Drug Label & FAERS API)');
  const fdaRes = await OpenFDATool.execute({ drugName: 'Deucravacitinib', queryType: 'both' }, dummyContext);
  if (!fdaRes.success || !fdaRes.output.label) {
    throw new Error(`OpenFDATool failed: ${JSON.stringify(fdaRes)}`);
  }
  console.log(`  ✔ Resolved FDA Label: ${fdaRes.output.label.brandName} (${fdaRes.output.label.genericName}, Mfr: ${fdaRes.output.label.manufacturer})`);
  console.log(`    Boxed Warning: ${fdaRes.output.label.boxedWarning.slice(0, 80)}...`);
  console.log(`    FAERS Signals: ${fdaRes.output.topAdverseEvents?.map((e: any) => `${e.reaction} (${e.count})`).join(', ') || 'Available'}`);

  // Test 3: NLM RxNorm / RxNav
  console.log('\n[Test 3/6] Live RxNormTool (NLM RxNorm & Drug Interaction API)');
  const rxRes = await RxNormTool.execute({ drugNameOrRxCUI: 'Deucravacitinib' }, dummyContext);
  if (!rxRes.success || !rxRes.output.rxcui) {
    throw new Error(`RxNormTool failed: ${JSON.stringify(rxRes)}`);
  }
  console.log(`  ✔ Resolved Canonical RxCUI: ${rxRes.output.rxcui} (${rxRes.output.canonicalName})`);

  // Test 4: NLM DailyMed
  console.log('\n[Test 4/6] Live DailyMedTool (NLM DailyMed SPL Package Inserts)');
  const dailyRes = await DailyMedTool.execute({ drugName: 'Deucravacitinib' }, dummyContext);
  if (!dailyRes.success || !dailyRes.output.splRecords || dailyRes.output.splRecords.length === 0) {
    throw new Error(`DailyMedTool failed: ${JSON.stringify(dailyRes)}`);
  }
  console.log(`  ✔ Resolved ${dailyRes.output.splRecords.length} SPL record(s) on DailyMed (SetID: ${dailyRes.output.splRecords[0].setId})`);

  // Test 5: NIH MedlinePlus
  console.log('\n[Test 5/6] Live MedlinePlusTool (NIH MedlinePlus Consumer Health)');
  const medlineRes = await MedlinePlusTool.execute({ topicOrCondition: 'Lupus' }, dummyContext);
  if (!medlineRes.success || !medlineRes.output.topics || medlineRes.output.topics.length === 0) {
    throw new Error(`MedlinePlusTool failed: ${JSON.stringify(medlineRes)}`);
  }
  console.log(`  ✔ Resolved MedlinePlus Topic: ${medlineRes.output.topics[0].title}`);

  // Test 6: CritiqueEngine Clinical NCT Verification
  console.log('\n[Test 6/6] Live CritiqueEngine (Clinical Trial & PMID Validation)');
  const critique = new CritiqueEngine();
  const validDraft = `Investigating Phase 3 trials in Lupus Nephritis (${topTrial.nctId}). [Evidence: EV-1]`;
  const invalidDraft = `Fake trial reported in NCT99999999.`;

  const validCtChecks = await critique.verifyClinicalTrials(validDraft);
  const invalidCtChecks = await critique.verifyClinicalTrials(invalidDraft);

  console.log(`  ✔ Valid trial check: ${validCtChecks[0]?.nctId} -> verified = ${validCtChecks[0]?.verified}`);
  console.log(`  ✔ Fake trial check : ${invalidCtChecks[0]?.nctId} -> verified = ${invalidCtChecks[0]?.verified} (${invalidCtChecks[0]?.error || 'N/A'})`);

  if (!validCtChecks[0]?.verified || invalidCtChecks[0]?.verified) {
    throw new Error('CritiqueEngine clinical trial NCT validation failed');
  }

  console.log('\n✔ ALL 6 MEDICAL & CLINICAL TEST SUITES PASSED (100% SUCCESS)\n');
}

testMedicalConnectors().catch((err) => {
  console.error('\n✖ Medical connectors test failed:', err);
  process.exit(1);
});
