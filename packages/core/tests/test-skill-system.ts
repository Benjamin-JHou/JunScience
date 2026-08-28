import { globalSkillRegistry, SkillRegistry } from '../src/index.js';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

async function testSkillSystem() {
  console.log('=== Running JunScience Scientific Skill System Verification Suite ===\n');

  // Test 1: Bundled Skills Integrity
  console.log('[Test 1/4] Bundled Scientific Skills Verification');
  const bundled = globalSkillRegistry.listBundled();
  console.log(`  ✔ Found ${bundled.length} bundled skills: ${bundled.map((s) => s.id).join(', ')}`);
  if (bundled.length < 4) {
    throw new Error(`Expected at least 4 bundled skills, found ${bundled.length}`);
  }

  // Test 2: Semantic Discovery
  console.log('\n[Test 2/4] Semantic Skill Discovery for Scientific Queries');
  const pathwayHits = globalSkillRegistry.discover('hypergeometric pathway cascade analysis for autoimmune genes');
  console.log(`  ✔ Query: "pathway cascade" -> Discovered: ${pathwayHits.map((s) => s.displayName).join(', ')}`);
  if (!pathwayHits.some((s) => s.id === 'pathway-enrichment')) {
    throw new Error('Failed to discover pathway-enrichment skill');
  }

  const sarHits = globalSkillRegistry.discover('SAR and Lipinski pharmacophore mapping for kinase inhibitor');
  console.log(`  ✔ Query: "SAR pharmacophore" -> Discovered: ${sarHits.map((s) => s.displayName).join(', ')}`);
  if (!sarHits.some((s) => s.id === 'sar-pharmacophore-mapping')) {
    throw new Error('Failed to discover sar-pharmacophore-mapping skill');
  }

  // Test 3: Prompt Formatting for Inquiry
  console.log('\n[Test 3/4] System Prompt Skill Injection');
  const promptInjection = globalSkillRegistry.formatPromptForInquiry('Analyze TYK2 domain architecture and PDB 3D binding pocket');
  console.log(`  ✔ Generated Skill Injection (${promptInjection.length} chars):\n${promptInjection.slice(0, 250)}...`);
  if (!promptInjection.includes('Protein Domain Architecture')) {
    throw new Error('Skill prompt injection missing protein-domain-architect');
  }

  // Test 4: User-Installed Skill Dynamic Loading
  console.log('\n[Test 4/4] User-Installed Skill (OpenScience-compatible SKILL.md)');
  const tempUserSkillsDir = path.join(os.tmpdir(), `junscience_test_skills_${Date.now()}`);
  const customSkillDir = path.join(tempUserSkillsDir, 'custom-crispr-screen');
  fs.mkdirSync(customSkillDir, { recursive: true });

  const customSkillMd = `---
name: Custom CRISPR Screening
description: Genome-wide CRISPR knockout screen analysis using MAGeCK MLE.
category: genomics
---

### Standard Operating Procedure
1. Parse sgRNA count matrix.
2. Run MAGeCK MLE in Python sandbox.
3. Identify essential fitness genes with FDR < 0.05.
`;
  fs.writeFileSync(path.join(customSkillDir, 'SKILL.md'), customSkillMd);

  const customRegistry = new SkillRegistry(tempUserSkillsDir);
  const userSkills = customRegistry.listUserInstalled();
  console.log(`  ✔ Loaded ${userSkills.length} user-installed skill(s): ${userSkills.map((s) => s.displayName).join(', ')}`);
  if (userSkills.length === 0 || userSkills[0].id !== 'custom-crispr-screen') {
    throw new Error('Failed to load user-installed skill from SKILL.md');
  }

  // Cleanup temp dir
  try {
    fs.rmSync(tempUserSkillsDir, { recursive: true, force: true });
  } catch {
    // ignore
  }

  console.log('\n✔ ALL SKILL SYSTEM TESTS PASSED (100% SUCCESS)\n');
}

testSkillSystem().catch((err) => {
  console.error('\n✖ Skill system test failed:', err);
  process.exit(1);
});
