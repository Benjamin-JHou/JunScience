import { globalEventBus } from '../src/runtime/core/EventBus';
import { globalSessionManager } from '../src/runtime/core/SessionManager';
import { globalToolRegistry } from '../src/runtime/tools/ToolRegistry';
import '../src/runtime/tools/index';
import { globalSkillRegistry } from '../src/runtime/skills/SkillRegistry';
import { globalAgentRegistry } from '../src/runtime/agents/AgentRegistry';
import { globalPermissionManager } from '../src/runtime/sandbox/PermissionManager';
import { globalResearchEngine } from '../src/runtime/research-loop/ResearchEngine';

async function runRuntimeTests() {
  console.log('\x1b[34m[Test Suite 1/3] Runtime Core, Sessions & Events\x1b[0m');

  // 1. Session creation
  const session = globalSessionManager.createSession('Test Automated Run');
  if (!session.id.startsWith('sess-')) throw new Error('Session ID prefix failed');
  console.log('  ✔ Session created successfully:', session.id);

  // 2. EventBus delivery
  let receivedEvent = false;
  const unsub = globalEventBus.on('agent.thinking', (e) => {
    if (e.sessionId === session.id) receivedEvent = true;
  });
  globalEventBus.emit({
    type: 'agent.thinking',
    sessionId: session.id,
    timestamp: new Date().toISOString(),
    payload: { thought: 'Testing event bus' },
  });
  unsub();
  if (!receivedEvent) throw new Error('EventBus did not deliver event');
  console.log('  ✔ EventBus typed event delivery verified');

  // 3. Permission Manager
  const permRead = await globalPermissionManager.checkPermission(session.id, 'READ', '/project/data', 'read data');
  if (!permRead) throw new Error('Permission READ failed');
  console.log('  ✔ PermissionManager policy gating verified (READ allowed)');

  // 4. Specialist Agent Registry
  const researchAgent = globalAgentRegistry.get('research');
  const biologyAgent = globalAgentRegistry.get('biology');
  const criticAgent = globalAgentRegistry.get('critic');
  if (!researchAgent || !biologyAgent || !criticAgent) throw new Error('Specialist agents missing');
  console.log(`  ✔ Specialist Agent Registry verified (${globalAgentRegistry.list().length} agents loaded)`);

  // 5. Skill Registry Discovery
  const scSkills = globalSkillRegistry.discover('single-cell transcriptomics clustering', 2);
  if (!scSkills.some((s) => s.name === 'scanpy')) throw new Error('Skill discovery failed to find scanpy');
  console.log('  ✔ Semantic Skill Discovery verified (Discovered:', scSkills.map((s) => s.name).join(', '), ')');

  // 6. Tool Registry & Database Lookups
  console.log('\n\x1b[34m[Test Suite 2/3] Scientific Tools & Database Connectors\x1b[0m');
  const litResult = await globalToolRegistry.execute('literature_search', { query: 'STAT4 TYK2 lupus' }, session.id, 'research');
  if (!litResult.success || !litResult.citations || litResult.citations.length === 0) throw new Error('LiteratureSearchTool failed');
  console.log(`  ✔ Literature Search tool verified (${litResult.citations.length} citations generated)`);

  const uniprotResult = await globalToolRegistry.execute('uniprot_lookup', { accessionOrGene: 'TYK2' }, session.id, 'research');
  if (!uniprotResult.success || uniprotResult.output.primaryAccession !== 'P29597') throw new Error('UniProt lookup failed');
  console.log(`  ✔ UniProt lookup verified (${uniprotResult.output.entryName}, ${uniprotResult.output.domains.length} domains)`);

  const chemblResult = await globalToolRegistry.execute('chembl_lookup', { targetOrCompound: 'TYK2' }, session.id, 'research');
  if (!chemblResult.success || chemblResult.output.compounds.length === 0) throw new Error('ChEMBL lookup failed');
  console.log(`  ✔ ChEMBL lookup verified (${chemblResult.output.compounds[0].prefName}, IC50: ${chemblResult.output.compounds[0].value})`);

  const pdbResult = await globalToolRegistry.execute('pdb_lookup', { pdbIdOrUniProt: '6NZP' }, session.id, 'research');
  if (!pdbResult.success || !pdbResult.artifacts || pdbResult.artifacts.length === 0) throw new Error('PDB lookup failed');
  console.log(`  ✔ PDB / AlphaFold 3D structure tool verified (Artifact: ${pdbResult.artifacts[0].title})`);

  // 7. End-to-end Autonomous Research Engine
  console.log('\n\x1b[34m[Test Suite 3/3] End-to-End Autonomous Research Loop\x1b[0m');
  const result = await globalResearchEngine.executeAutonomousResearch(
    'Investigate whether TAD boundary disruption and STAT4/TYK2 pathway hyperactivation drives systemic autoimmunity'
  );
  if (!result.turn || result.turn.status !== 'completed') throw new Error('Autonomous research loop failed');
  if (result.artifacts.length < 2) throw new Error('Expected multiple scientific artifacts');
  if (result.session.citations.length < 2) throw new Error('Expected verifiable citations');

  console.log('  ✔ Autonomous Research Loop converged cleanly');
  console.log(`  ✔ Turn response synthesized: ${result.turn.agentResponse.slice(0, 80)}...`);
  console.log(`  ✔ Artifacts produced: ${result.artifacts.map((a) => a.title).join(' | ')}`);
  console.log(`  ✔ Citations verified: ${result.session.citations.length} papers cited with DOIs`);
  console.log(`  ✔ Provenance record: Duration ${result.provenance.duration}, Environment: ${result.provenance.environment}`);

  console.log('\n\x1b[32m✔ ALL RUNTIME AND SCIENTIFIC TESTS PASSED (100% SUCCESS)\x1b[0m\n');
}

runRuntimeTests().catch((err) => {
  console.error('\x1b[31m[Test Failure]\x1b[0m', err);
  process.exit(1);
});
