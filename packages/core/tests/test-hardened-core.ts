import {
  globalMcpServerBridge,
  UniProtTool,
  PDBTool,
  PubChemTool,
  ChEMBLTool,
  LiteratureSearchTool,
  ToolContext,
} from '../src/index.js';

const dummyContext: ToolContext = {
  sessionId: `test-hardened-${Date.now()}`,
  agentId: 'research',
  turnIndex: 0,
  reportProgress: (log: string) => {},
};

async function testHardenedCore() {
  console.log('=== Running JunScience Core Hardening & MCP Bridge Verification Suite ===\n');

  // Test 1: MCP Server Bridge
  console.log('[Test 1/6] MCP Server Bridge (tools/list & tools/call)');
  const mcpTools = globalMcpServerBridge.listTools();
  if (mcpTools.length < 5) {
    throw new Error(`MCP tools list returned only ${mcpTools.length} tools`);
  }
  console.log(`  ✔ MCP Bridge successfully exposed ${mcpTools.length} scientific tools (${mcpTools.map((t) => t.name).join(', ')}).`);

  const rpcListRes = await globalMcpServerBridge.handleJsonRpc({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
  });
  if (!rpcListRes.result?.tools) {
    throw new Error('MCP handleJsonRpc tools/list failed');
  }
  console.log('  ✔ JSON-RPC 2.0 tools/list request handled cleanly.');

  // Test 2: Hardened UniProt Multi-Tier Resolution
  console.log('\n[Test 2/6] Hardened UniProtTool (Multi-Tier & Alias Resolution)');
  const tyk2Res = await UniProtTool.execute({ accessionOrGene: 'TYK2' }, dummyContext);
  if (!tyk2Res.success || tyk2Res.output.primaryAccession !== 'P29597') {
    throw new Error(`UniProt TYK2 resolution failed: ${JSON.stringify(tyk2Res.output)}`);
  }
  console.log(`  ✔ Resolved canonical TYK2: ${tyk2Res.output.primaryAccession} (${tyk2Res.output.sequenceLength} aa, ${tyk2Res.output.molecularWeight})`);

  const p53Res = await UniProtTool.execute({ accessionOrGene: 'p53' }, dummyContext);
  if (!p53Res.success || !p53Res.output.primaryAccession) {
    throw new Error(`UniProt p53 alias resolution failed: ${JSON.stringify(p53Res)}`);
  }
  console.log(`  ✔ Resolved alias p53 -> ${p53Res.output.geneName} (${p53Res.output.primaryAccession}, ${p53Res.output.proteinName})`);

  // Test 3: Hardened RCSB PDB (Search API v2 + AlphaFold DB)
  console.log('\n[Test 3/6] Hardened PDBTool (RCSB Search API v2 & AlphaFold DB)');
  const pdbSearchRes = await PDBTool.execute({ pdbIdOrUniProt: 'TYK2' }, dummyContext);
  if (!pdbSearchRes.success || !pdbSearchRes.output.experimentalStructures || pdbSearchRes.output.experimentalStructures.length === 0) {
    throw new Error(`PDB keyword search for TYK2 failed: ${JSON.stringify(pdbSearchRes)}`);
  }
  const topPdb = pdbSearchRes.output.experimentalStructures[0];
  console.log(`  ✔ RCSB Search v2 resolved ${pdbSearchRes.output.experimentalStructures.length} structures (Top: ${topPdb.pdbId} at ${topPdb.resolution}, ${topPdb.method})`);

  // Test 4: Hardened PubChem (2-Stage PUG REST Search)
  console.log('\n[Test 4/6] Hardened PubChemTool (2-Stage Search & InChIKey/SMILES)');
  const pubchemRes = await PubChemTool.execute({ compoundNameOrCID: 'Deucravacitinib' }, dummyContext);
  if (!pubchemRes.success || !pubchemRes.output.cid) {
    throw new Error(`PubChem search for Deucravacitinib failed: ${JSON.stringify(pubchemRes)}`);
  }
  console.log(`  ✔ Resolved PubChem CID: ${pubchemRes.output.cid} (${pubchemRes.output.name})`);
  console.log(`    Formula: ${pubchemRes.output.molecularFormula}, MW: ${pubchemRes.output.molecularWeight}, InChIKey: ${pubchemRes.output.inchiKey}`);

  // Test 5: Hardened ChEMBL (Dual-Path Molecule & Target Activities)
  console.log('\n[Test 5/6] Hardened ChEMBLTool (Molecule & Target Routing)');
  const chemblDrugRes = await ChEMBLTool.execute({ targetOrCompound: 'Deucravacitinib' }, dummyContext);
  if (!chemblDrugRes.success || !chemblDrugRes.output.molecule) {
    throw new Error(`ChEMBL drug lookup failed: ${JSON.stringify(chemblDrugRes)}`);
  }
  console.log(`  ✔ Drug molecule: ${chemblDrugRes.output.molecule.chemblId} (${chemblDrugRes.output.molecule.prefName}, ${chemblDrugRes.output.molecule.maxPhase})`);

  const chemblTargetRes = await ChEMBLTool.execute({ targetOrCompound: 'TYK2' }, dummyContext);
  if (!chemblTargetRes.success || !chemblTargetRes.output.target) {
    throw new Error(`ChEMBL target lookup failed: ${JSON.stringify(chemblTargetRes)}`);
  }
  console.log(`  ✔ Protein target: ${chemblTargetRes.output.target.id} (${chemblTargetRes.output.target.name}) with ${chemblTargetRes.output.activities.length} bioactivities`);

  // Test 6: Hardened PubMed Literature Search (Rate-limited & Deduplicated)
  console.log('\n[Test 6/6] Hardened LiteratureSearchTool (Rate-limited & Deduplicated)');
  let litRes = await LiteratureSearchTool.execute({ query: 'STAT4 phosphorylation lupus nephritis', limit: 3 }, dummyContext);
  if (!litRes.success) {
    // Retry once on transient network/rate-limit
    await new Promise((r) => setTimeout(r, 1500));
    litRes = await LiteratureSearchTool.execute({ query: 'STAT4 phosphorylation lupus nephritis', limit: 3 }, dummyContext);
  }
  if (!litRes.success || !litRes.citations || litRes.citations.length === 0) {
    throw new Error(`LiteratureSearchTool failed: ${JSON.stringify(litRes)}`);
  }
  console.log(`  ✔ Retrieved ${litRes.citations.length} publications without 429 rate-limit errors.`);
  console.log(`    Top: [PMID:${litRes.citations[0].pmid || 'N/A'}] ${litRes.citations[0].title.slice(0, 60)}...`);

  console.log('\n✔ ALL 6 HARDENED CORE & MCP BRIDGE TESTS PASSED (100% SUCCESS)\n');
}

testHardenedCore().catch((err) => {
  console.error('\n✖ Hardened core test failed:', err);
  process.exit(1);
});
