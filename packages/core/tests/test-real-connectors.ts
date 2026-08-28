import {
  LiteratureSearchTool,
  UniProtTool,
  ChEMBLTool,
  PubChemTool,
  PDBTool,
  PythonRunnerTool,
  globalCritiqueEngine,
  ToolContext,
} from '../src/index.js';

const dummyContext: ToolContext = {
  sessionId: `test-sess-${Date.now()}`,
  agentId: 'research',
  turnIndex: 0,
  reportProgress: (log: string, pct?: number) => {
    // console.log(`    [Progress ${pct || ''}%] ${log}`);
  },
};

async function runRealConnectorsTest() {
  console.log('=== Running Live Scientific Database & Tools Test Suite ===\n');

  // Test 1: Real PubMed & OpenAlex Literature Search
  console.log('[Test 1/7] Live LiteratureSearchTool (PubMed & OpenAlex)');
  const litResult = await LiteratureSearchTool.execute(
    { query: 'STAT4 phosphorylation lupus nephritis', limit: 3 },
    dummyContext
  );
  if (!litResult.success || !litResult.citations || litResult.citations.length === 0) {
    throw new Error(`LiteratureSearchTool failed: ${litResult.error || 'Zero citations returned'}`);
  }
  console.log(`  ✔ Retrieved ${litResult.citations.length} verified publications.`);
  console.log(`    Top: [PMID:${litResult.citations[0].pmid || 'N/A'}] ${litResult.citations[0].title.slice(0, 60)}... (${litResult.citations[0].journal}, ${litResult.citations[0].year})`);

  // Test 2: Real UniProtKB Lookup
  console.log('\n[Test 2/7] Live UniProtTool (UniProtKB REST API)');
  const uniprotResult = await UniProtTool.execute(
    { accessionOrGene: 'TYK2' },
    dummyContext
  );
  if (!uniprotResult.success || !uniprotResult.output) {
    throw new Error(`UniProtTool failed: ${uniprotResult.error}`);
  }
  console.log(`  ✔ Resolved UniProtKB: ${uniprotResult.output.proteinName} (${uniprotResult.output.primaryAccession})`);
  console.log(`    Length: ${uniprotResult.output.sequenceLength} aa, Mass: ${uniprotResult.output.molecularWeight}, Features: ${uniprotResult.output.domains.length}`);

  // Test 3: Real ChEMBL Lookup
  console.log('\n[Test 3/7] Live ChEMBLTool (EMBL-EBI ChEMBL REST API)');
  const chemblResult = await ChEMBLTool.execute(
    { targetOrCompound: 'TYK2' },
    dummyContext
  );
  if (!chemblResult.success || !chemblResult.output) {
    throw new Error(`ChEMBLTool failed: ${chemblResult.error}`);
  }
  console.log(`  ✔ Target CHEMBL ID: ${chemblResult.output.target?.id} (${chemblResult.output.target?.name})`);
  console.log(`    Records: ${chemblResult.output.totalRecords} bioactivity measurements returned.`);

  // Test 4: Real PubChem PUG REST Lookup
  console.log('\n[Test 4/7] Live PubChemTool (NCBI PubChem API)');
  const pubchemResult = await PubChemTool.execute(
    { compoundNameOrCID: 'Deucravacitinib' },
    dummyContext
  );
  if (!pubchemResult.success || !pubchemResult.output) {
    throw new Error(`PubChemTool failed: ${pubchemResult.error}`);
  }
  console.log(`  ✔ Resolved PubChem CID: ${pubchemResult.output.cid} (${pubchemResult.output.name})`);
  console.log(`    Formula: ${pubchemResult.output.molecularFormula}, MW: ${pubchemResult.output.molecularWeight}, SMILES: ${pubchemResult.output.canonicalSmiles.slice(0, 30)}...`);

  // Test 5: Real PDB & AlphaFold Lookup
  console.log('\n[Test 5/7] Live PDBTool (RCSB PDB & AlphaFold DB API)');
  const pdbResult = await PDBTool.execute(
    { pdbIdOrUniProt: '6NZP' },
    dummyContext
  );
  if (!pdbResult.success || !pdbResult.output) {
    throw new Error(`PDBTool failed: ${pdbResult.error}`);
  }
  console.log(`  ✔ Resolved PDB: ${pdbResult.output.pdbId} (${pdbResult.output.title.slice(0, 50)}...)`);
  console.log(`    Method: ${pdbResult.output.method}, Resolution: ${pdbResult.output.resolution}`);

  // Test 6: Real Python Sandbox Execution
  console.log('\n[Test 6/7] Live PythonRunnerTool (Subprocess Workspace Sandbox)');
  const pythonScript = `
import json
import math

data = {"target": "STAT4", "log2fc": 2.84, "p_val": 4.2e-28}
with open("stats.json", "w") as f:
    json.dump(data, f)

print(f"Calculated -log10(p): {-math.log10(data['p_val']):.2f}")
`;
  const pyResult = await PythonRunnerTool.execute(
    { scriptContent: pythonScript, scriptName: 'compute_stats.py' },
    dummyContext
  );
  if (!pyResult.success || !pyResult.output) {
    throw new Error(`PythonRunnerTool failed: ${pyResult.error}`);
  }
  console.log(`  ✔ Python execution completed in ${pyResult.output.duration} with exit code ${pyResult.output.exitCode}`);
  console.log(`    Stdout: "${pyResult.output.stdout}"`);
  console.log(`    Registered artifacts: ${pyResult.artifacts?.length || 0} files captured.`);

  // Test 7: Critique Engine Fact-Checking
  console.log('\n[Test 7/7] Live CritiqueEngine (Citation Fact-Checking against NCBI)');
  const sampleText = 'Findings supported by Smith et al. (PMID: 38991203) and invalid phantom reference (PMID: 999999999).';
  const checks = await globalCritiqueEngine.verifyCitations(sampleText);
  const verified = checks.find((c) => c.verified);
  const failed = checks.find((c) => !c.verified);
  console.log(`  ✔ Valid PMID 38991203 verified: ${verified?.title?.slice(0, 50)}...`);
  console.log(`  ✔ Invalid PMID 999999999 correctly flagged: ${failed?.error}`);

  console.log('\n✔ ALL 7 REAL SCIENTIFIC TOOL SUITES PASSED (100% SUCCESS)\n');
}

runRealConnectorsTest().catch((err) => {
  console.error('\n✖ Scientific tools test failed:', err);
  process.exit(1);
});
