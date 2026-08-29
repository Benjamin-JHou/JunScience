import { SkillDefinition } from '../../types/skills.js';

export const ReproducibilityPackagingSkill: SkillDefinition = {
  id: 'reproducibility-packaging',
  name: 'reproducibility-packaging',
  displayName: 'Scientific Pipeline Reproducibility & Provenance Packaging',
  description: 'Package complete research pipelines into deterministic reproducibility bundles (manifest.json) containing executed script hashes, random seeds, input data SHA-256 digests, runtime environment snapshots, and parameter dictionaries.',
  category: 'reproducibility',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['python_runner'],
  keywords: ['reproducibility', 'provenance', 'manifest', 'sha256', 'pipeline', 'audit', 'integrity', 'open science'],
  workflowSteps: [
    '1. Collect all execution parameters, input file paths, and random number generator seeds.',
    '2. Compute SHA-256 cryptographic digests for input datasets and generated output artifacts.',
    '3. Capture Python interpreter and key scientific package version manifests.',
    '4. Assemble structured reproducibility_manifest.json bundle.',
    '5. Validate that re-running the recorded script with identical seeds produces byte-identical results.',
  ],
  instructions: `When packaging for reproducibility:
- Always include explicit random seed declarations (e.g. seed = 2026).
- Record SHA-256 hashes for both code scripts and generated figures/tables.
- Provide a single-command reproduction instruction (e.g. "python reproduce_analysis.py --config manifest.json").`,
  examples: [
    'Package an end-to-end RNA-seq DEG and survival analysis pipeline into a reproducible manifest bundle.',
    'Create an audit trail for clinical trial adverse event disproportionality calculations.',
  ],
  helperScripts: {
    'manifest_builder.py': `
import hashlib
import json
import time

def build_reproducibility_manifest(pipeline_name: str, params: dict, seed: int = 2026) -> dict:
    manifest = {
        "pipeline_name": pipeline_name,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "random_seed": seed,
        "parameters": params,
        "framework": "JunScience Scientific Workstation v1.0.0",
        "verification_hash": hashlib.sha256(json.dumps(params, sort_keys=True).encode()).hexdigest()
    }
    return manifest
`,
  },
};
