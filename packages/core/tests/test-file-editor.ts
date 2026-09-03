import { FileEditorTool } from '../src/tools/execution/FileEditorTool.js';
import { ToolContext } from '../src/types/tools.js';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

async function testFileEditorSuite() {
  console.log('=== Running JunScience Confined FileEditorTool Verification Suite ===\n');

  const sessionId = `test-editor-${Date.now()}`;
  const context: ToolContext = {
    sessionId,
    agentId: 'research',
    turnIndex: 1,
    reportProgress: () => {},
  };

  const workspaceRoot = process.env.JUNSCIENCE_HOME || path.join(os.homedir(), '.junscience');
  const sessionWorkspace = path.resolve(workspaceRoot, 'workspace', sessionId);

  // [Phase 1: Valid Workspace File Operations]
  console.log('[Phase 1: Valid Workspace File Operations]');

  // 1.1 Write new manuscript file
  console.log('  [1.1] Write new text file: "manuscript_draft.tex"');
  const initialTex = `\\documentclass[11pt]{article}
\\title{TYK2 Allosteric Inhibition in Autoimmune Diseases}
\\author{JunScience Consortium}
\\begin{document}
\\maketitle
\\section{Abstract}
Targeting the pseudokinase JH2 domain of TYK2 achieves high selectivity.
\\section{Results}
Deucravacitinib demonstrated IC50 = 12.5 nM.
\\end{document}`;

  const writeRes = await FileEditorTool.execute(
    { path: 'manuscript_draft.tex', action: 'write', content: initialTex },
    context
  );

  if (!writeRes.success || writeRes.output.totalLinesAfter !== 10) {
    throw new Error(`Write action failed: ${writeRes.error}`);
  }
  console.log(`    ✔ File created: ${writeRes.execution.resultSummary}`);

  // 1.2 View file slice
  console.log('\n  [1.2] View file slice: lines 6 to 8');
  const viewRes = await FileEditorTool.execute(
    { path: 'manuscript_draft.tex', action: 'view', startLine: 6, endLine: 8 },
    context
  );

  if (!viewRes.success || viewRes.output.displayedRange[0] !== 6 || viewRes.output.displayedRange[1] !== 8) {
    throw new Error(`View action failed: ${viewRes.error}`);
  }
  console.log(`    ✔ View slice [6-8]:\n${viewRes.output.content.split('\n').map((l: string) => '      | ' + l).join('\n')}`);

  // 1.3 String Replacement (str_replace)
  console.log('\n  [1.3] Precision replacement (str_replace): IC50 update');
  const replaceRes = await FileEditorTool.execute(
    {
      path: 'manuscript_draft.tex',
      action: 'str_replace',
      oldStr: 'IC50 = 12.5 nM',
      newStr: 'IC50 = 1.0 nM (sub-nanomolar potency)',
    },
    context
  );

  if (!replaceRes.success) {
    throw new Error(`str_replace failed: ${replaceRes.error}`);
  }
  console.log(`    ✔ Replacement succeeded:\n      Diff:\n      ${replaceRes.output.previewDiff.replace('\n', '\n      ')}`);

  // 1.4 Line Insertion (insert_lines)
  console.log('\n  [1.4] Line insertion (insert_lines): Add Methods section');
  const insertRes = await FileEditorTool.execute(
    {
      path: 'manuscript_draft.tex',
      action: 'insert_lines',
      insertAfterLine: 8,
      insertContent: `\\section{Methods}\nBinding affinities were determined using TR-FRET assays.`,
    },
    context
  );

  if (!insertRes.success || insertRes.output.insertedLinesCount !== 2) {
    throw new Error(`insert_lines failed: ${insertRes.error}`);
  }
  console.log(`    ✔ Inserted 2 lines after line 8. Total lines now: ${insertRes.output.totalLinesAfter}`);

  // 1.5 File Append (append)
  console.log('\n  [1.5] File append (append): Add bibliography notice');
  const appendRes = await FileEditorTool.execute(
    {
      path: 'manuscript_draft.tex',
      action: 'append',
      appendContent: `% Data verified by JunScience Evidence Verification Gate`,
    },
    context
  );

  if (!appendRes.success) {
    throw new Error(`append failed: ${appendRes.error}`);
  }
  console.log(`    ✔ Appended comment line. Total lines: ${appendRes.output.totalLinesAfter}`);

  // [Phase 2: Strict Sandbox Security & Boundary Containment]
  console.log('\n[Phase 2: Strict Sandbox Security & Boundary Containment]');

  // 2.1 Attempt Path Traversal Write (../../etc/passwd)
  console.log('  [2.1] Probe Path Traversal: "../../etc/passwd"');
  const escapeRes1 = await FileEditorTool.execute(
    { path: '../../etc/passwd', action: 'write', content: 'root:evil' },
    context
  );
  if (escapeRes1.success || !escapeRes1.error?.includes('[SecurityError]')) {
    throw new Error(`CRITICAL SECURITY FAILURE: FileEditorTool allowed path traversal escape!`);
  }
  console.log(`    ✔ Traversal write successfully blocked: ${escapeRes1.error}`);

  // 2.2 Attempt Root Absolute Path Write (/tmp/forbidden.txt)
  console.log('\n  [2.2] Probe Absolute Path: "/tmp/leak_test.txt"');
  const escapeRes2 = await FileEditorTool.execute(
    { path: '/tmp/leak_test.txt', action: 'write', content: 'unauthorized data' },
    context
  );
  if (escapeRes2.success || !escapeRes2.error?.includes('[SecurityError]')) {
    throw new Error(`CRITICAL SECURITY FAILURE: FileEditorTool allowed write outside workspace!`);
  }
  console.log(`    ✔ Absolute path write successfully blocked: ${escapeRes2.error}`);

  // 2.3 Attempt User Home Sensitive Dir Probe (~/.ssh/id_rsa)
  console.log('\n  [2.3] Probe Host Secret Dir: "../../../.ssh/id_rsa"');
  const escapeRes3 = await FileEditorTool.execute(
    { path: '../../../.ssh/id_rsa', action: 'view' },
    context
  );
  if (escapeRes3.success || !escapeRes3.error?.includes('[SecurityError]')) {
    throw new Error(`CRITICAL SECURITY FAILURE: FileEditorTool allowed reading host secret directory!`);
  }
  console.log(`    ✔ Secret directory read probe successfully blocked: ${escapeRes3.error}`);

  // 2.4 Attempt to follow an in-workspace symlink to an external file
  console.log('\n  [2.4] Probe Symbolic Link Escape');
  const outsideTarget = path.join(workspaceRoot, `outside-target-${Date.now()}.txt`);
  const symlinkPath = path.join(sessionWorkspace, 'external-link.txt');
  fs.writeFileSync(outsideTarget, 'original', 'utf-8');
  fs.symlinkSync(outsideTarget, symlinkPath);
  const symlinkRes = await FileEditorTool.execute(
    { path: 'external-link.txt', action: 'write', content: 'overwritten' },
    context
  );
  if (symlinkRes.success || fs.readFileSync(outsideTarget, 'utf-8') !== 'original') {
    throw new Error('CRITICAL SECURITY FAILURE: FileEditorTool followed a symlink outside the workspace');
  }
  fs.unlinkSync(symlinkPath);
  fs.unlinkSync(outsideTarget);
  console.log(`    ✔ Symbolic link escape blocked: ${symlinkRes.error}`);

  // 2.5 Error Handling: Ambiguous Non-Unique str_replace
  console.log('\n  [2.5] Error Handling: Non-unique replacement string');
  const nonUniqueRes = await FileEditorTool.execute(
    { path: 'manuscript_draft.tex', action: 'str_replace', oldStr: '\\section', newStr: '\\chapter' },
    context
  );
  if (nonUniqueRes.success || !nonUniqueRes.error?.includes('[EditError]')) {
    throw new Error(`FileEditorTool should reject ambiguous non-unique oldStr!`);
  }
  console.log(`    ✔ Ambiguous match safely rejected: ${nonUniqueRes.error}`);

  // Cleanup session workspace
  try {
    if (fs.existsSync(sessionWorkspace)) {
      fs.rmSync(sessionWorkspace, { recursive: true, force: true });
    }
  } catch {
    // ignore
  }

  console.log('\n=============================================================');
  console.log('✔ ALL FILE EDITOR TOOL OPERATIONS & SECURITY ISOLATION TESTS PASSED (100% SUCCESS)');
  console.log('=============================================================\n');
}

testFileEditorSuite().catch((err) => {
  console.error('FileEditor test failed:', err);
  process.exit(1);
});
