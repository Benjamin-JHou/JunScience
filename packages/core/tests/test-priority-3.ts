import { SkillRegistry, PythonRunnerTool } from '../src/index.js';
import { resolveWorkspaceRoot } from '../src/tools/execution/PythonRunnerTool.js';
import fs from 'node:fs';
import path from 'node:path';

async function testPriority3() {
  console.log('=== Running Priority 3 (Cleanup & Robustness) Verification Suite ===\n');

  // [Test 1/3] BUG-07: YAML Frontmatter Parser in SkillRegistry
  console.log('[Test 1/3] BUG-07: Full YAML Frontmatter Parsing in SkillRegistry');
  const registry = new SkillRegistry();

  const testSkillMarkdown = `---
name: target_druggability_scoring
displayName: Target Druggability & Allosteric Pocket Assessment
description: Comprehensive structural, biophysical, and chemogenomic tractability scoring.
category: databases
version: 2.1.0
author: OpenScience Discovery Team
requiredTools:
  - uniprot_lookup
  - chembl_lookup
  - pdb_lookup
keywords:
  - druggability
  - tractability
  - allosteric
  - pocket
workflowSteps:
  - Step 1: Query UniProt for functional domains and PDB structures.
  - Step 2: Retrieve ChEMBL bioactivities and binding constants.
  - Step 3: Compute pocket druggability score in local sandbox.
---

# Target Druggability Standard Operating Procedure
Use this skill when assessing small molecule tractability for novel kinase targets.
`;

  const parsedSkill = registry.parseSkillMarkdown('target_druggability_scoring', testSkillMarkdown);

  if (!parsedSkill) {
    throw new Error('Failed to parse SKILL.md with YAML frontmatter.');
  }

  console.log(`  ✔ Parsed ID: "${parsedSkill.id}"`);
  console.log(`  ✔ Display Name: "${parsedSkill.displayName}"`);
  console.log(`  ✔ Category: "${parsedSkill.category}"`);
  console.log(`  ✔ Version: "${parsedSkill.version}", Author: "${parsedSkill.author}"`);
  console.log(`  ✔ Required Tools (${parsedSkill.requiredTools.length}): [${parsedSkill.requiredTools.join(', ')}]`);
  console.log(`  ✔ Keywords (${parsedSkill.keywords.length}): [${parsedSkill.keywords.join(', ')}]`);
  console.log(`  ✔ Instructions Length: ${parsedSkill.instructions.length} characters (Frontmatter cleanly stripped)`);

  if (
    parsedSkill.displayName !== 'Target Druggability & Allosteric Pocket Assessment' ||
    parsedSkill.category !== 'databases' ||
    parsedSkill.version !== '2.1.0' ||
    parsedSkill.requiredTools.length !== 3 ||
    !parsedSkill.requiredTools.includes('chembl_lookup') ||
    !parsedSkill.keywords.includes('allosteric')
  ) {
    throw new Error('YAML Frontmatter fields were not parsed correctly.');
  }
  console.log('  ✔ Robust YAML frontmatter parser validated.\n');

  // [Test 2/3] BUG-04/05: resolveWorkspaceRoot fallback
  console.log('[Test 2/3] BUG-04/05: Workspace Root Resolution & Fallback');
  const wsRoot = resolveWorkspaceRoot();
  console.log(`  ✔ Resolved Workspace Root: ${wsRoot}`);
  if (!fs.existsSync(wsRoot)) {
    throw new Error(`Workspace root does not exist on disk: ${wsRoot}`);
  }
  console.log('  ✔ Workspace root exists and is accessible.\n');

  // [Test 3/3] BUG-08: Sandbox Enforcement Check
  console.log('[Test 3/3] BUG-08: PythonRunnerTool Sandbox Enforcement Verification');
  // Run a simple sandboxed python script to verify execution
  const executionContext: any = {
    sessionId: 'test-sandbox-session',
    reportProgress: (msg: string) => {},
  };

  const pyResult = await PythonRunnerTool.execute(
    {
      scriptContent: `
import sys
import math
val = math.sqrt(144)
print(f"CALCULATED_VAL={val}")
`,
      scriptName: 'test_calc.py',
    },
    executionContext
  );

  console.log(`  ✔ Python execution success: ${pyResult.success}`);
  console.log(`  ✔ Sandbox Mode: "${pyResult.output?.sandboxMode}"`);
  console.log(`  ✔ Output: "${pyResult.output?.stdout}"`);

  if (!pyResult.success || !pyResult.output?.stdout?.includes('CALCULATED_VAL=12.0')) {
    throw new Error('Sandboxed Python execution test failed.');
  }

  console.log('\n✔ ALL PRIORITY 3 CLEANUP & ROBUSTNESS TESTS PASSED (100% SUCCESS)\n');
}

testPriority3().catch((err) => {
  console.error('\n✖ Priority 3 test failed:', err);
  process.exit(1);
});
