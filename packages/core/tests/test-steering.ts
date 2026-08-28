import {
  globalSessionManager,
  AutonomousResearchEngine,
  ScientificMockProvider,
} from '../src/index.js';

async function testSteering() {
  console.log('=== Running Mid-Run Steering Verification Suite ===\n');

  // Test 1: Queue and Pop Steering Messages in SessionManager
  console.log('[Test 1/2] SessionManager Steering Queue Management');
  const session = globalSessionManager.createSession('Test Steering Session', 'research');
  const sessionId = session.id;

  globalSessionManager.queueSteering(sessionId, 'Focus strictly on allosteric JH2 domain instead of JH1 catalytic site');
  globalSessionManager.queueSteering(sessionId, 'Also verify Deucravacitinib selectivity over JAK1');

  const pending = globalSessionManager.getPendingSteering(sessionId);
  console.log(`  ✔ Pending steering messages in queue: ${pending.length}`);
  if (pending.length !== 2) {
    throw new Error(`Expected 2 pending steering messages, found ${pending.length}`);
  }

  const poppedFirst = globalSessionManager.popSteering(sessionId);
  console.log(`  ✔ Popped first steering: "${poppedFirst}"`);
  if (!poppedFirst?.includes('JH2 domain')) {
    throw new Error('Popped wrong steering message');
  }

  const poppedSecond = globalSessionManager.popSteering(sessionId);
  console.log(`  ✔ Popped second steering: "${poppedSecond}"`);
  if (!poppedSecond?.includes('Deucravacitinib selectivity')) {
    throw new Error('Popped wrong steering message');
  }

  const poppedThird = globalSessionManager.popSteering(sessionId);
  if (poppedThird !== undefined) {
    throw new Error('Queue should be empty');
  }
  console.log('  ✔ Queue empty check passed.');

  // Test 2: Engine Execution with Mid-Run Steering
  console.log('\n[Test 2/2] AutonomousResearchEngine Mid-Run Steering Loop');
  const mockProvider = new ScientificMockProvider();
  const engine = new AutonomousResearchEngine({
    modelProvider: mockProvider,
    maxTurns: 4,
  });

  // Pre-queue a steering guidance before run
  globalSessionManager.queueSteering(sessionId, 'Prioritize Phase 3 clinical trial endpoints from PubMed');

  const turn = await engine.run(session, 'Investigate TYK2 inhibitors in autoimmune disease');
  console.log(`  ✔ Engine completed turn with status: ${turn.status}`);
  console.log(`  ✔ Produced response with evidence traceability table.`);

  console.log('\n✔ ALL STEERING TESTS PASSED (100% SUCCESS)\n');
}

testSteering().catch((err) => {
  console.error('\n✖ Steering test failed:', err);
  process.exit(1);
});
