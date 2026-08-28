import {
  PlanTracker,
  EventBus,
} from '../src/index.js';

async function testPlanTracker() {
  console.log('=== Running Explicit Plan & To-Do Task Tracker Verification Suite ===\n');

  const bus = new EventBus();
  const tracker = new PlanTracker(bus);
  const sessionId = `test-plan-session-${Date.now()}`;

  const emittedEvents: string[] = [];
  bus.on('plan.created', (e) => emittedEvents.push(`plan.created:${e.payload.planId}`));
  bus.on('plan.task.updated', (e) => emittedEvents.push(`plan.task.updated:${e.payload.taskId}:${e.payload.status}`));
  bus.on('plan.task.completed', (e) => emittedEvents.push(`plan.task.completed:${e.payload.taskId}`));

  // 1. Create Plan
  console.log('[Test 1/3] Explicit Plan Creation & Milestone Generation');
  const inquiry = 'Investigate TYK2 JH2 allosteric domain vs ATP orthosteric binding';
  const plan = tracker.createPlan(sessionId, inquiry);

  console.log(`  ✔ Plan ID: ${plan.id} with ${plan.tasks.length} default milestones:`);
  plan.tasks.forEach((t) => console.log(`    - [${t.id.toUpperCase()}] (${t.category}) ${t.title}`));
  if (plan.tasks.length < 4) {
    throw new Error('Expected at least 4 scientific plan milestones');
  }

  // 2. Lifecycle transitions: start, complete, fail
  console.log('\n[Test 2/3] Plan Task Lifecycle & Evidence Mounting');
  tracker.startTask(sessionId, 'task-1');
  tracker.completeTask(sessionId, 'task-1', ['EV-1', 'EV-2'], 'Resolved 1187 aa sequence & 8Q4O crystal structure');

  tracker.startTask(sessionId, 'task-2');
  tracker.completeTask(sessionId, 'task-2', ['EV-3'], 'Identified 12.5 nM IC50 allosteric potency in ChEMBL');

  const updatedPlan = tracker.getPlan(sessionId);
  const task1 = updatedPlan?.tasks.find((t) => t.id === 'task-1');
  const task2 = updatedPlan?.tasks.find((t) => t.id === 'task-2');

  console.log(`  ✔ Task 1 status: ${task1?.status} (Anchors: ${task1?.evidenceIds.join(', ')})`);
  console.log(`  ✔ Task 2 status: ${task2?.status} (Anchors: ${task2?.evidenceIds.join(', ')})`);

  if (task1?.status !== 'completed' || task2?.status !== 'completed') {
    throw new Error('Task lifecycle completion assertion failed');
  }

  // 3. Format Checklist
  console.log('\n[Test 3/3] Report Checklist Formatting & Markdown Export');
  const checklist = tracker.formatPlanChecklist(sessionId);
  console.log(checklist);

  if (!checklist.includes('TASK-1') || !checklist.includes('EV-1')) {
    throw new Error('Checklist markdown export missing task or evidence anchors');
  }

  console.log(`  ✔ EventBus captured ${emittedEvents.length} plan events: ${emittedEvents.join(' | ')}`);
  console.log('\n✔ ALL PLAN & TO-DO TASK TRACKER TESTS PASSED (100% SUCCESS)\n');
}

testPlanTracker().catch((err) => {
  console.error('\n✖ Plan tracker test failed:', err);
  process.exit(1);
});
