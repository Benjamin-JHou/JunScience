# UPSTREAM.md — Upstream Tracking & Attribution

This document records the upstream open-source foundations adapted for **JunScience**.

---

## 1. Upstream Repositories

### `deepseek-ai/deepseek-harness`
- **Repository URL:** https://github.com/deepseek-ai/deepseek-harness
- **Pinned Commit:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
- **License:** MIT License
- **Copyright:** Copyright (c) 2026 DeepSeek AI
- **Role in JunScience:** Agent runtime foundation, plugin lifecycle, event bus, agent loop, tool registry, session persistence, permission gates, and job management.
- **Integration Status:** Architecture studied; core runtime patterns adapted into `src/runtime/core/`.

### `synthetic-sciences/openscience`
- **Repository URL:** https://github.com/synthetic-sciences/openscience
- **Pinned Commit:** `68485dfcc5a9d2fe6610f2bb1436bc368a64f5dc`
- **License:** Apache License 2.0
- **Copyright:** Copyright (c) Synthetic Sciences Inc.
- **Role in JunScience:** Scientific research workflows, specialist agent prompts (`research`, `critic`, `plan`), scientific database connectors (PubMed, UniProt, ChEMBL, PDB), evidence model, and artifact provenance.
- **Integration Status:** Architecture studied; scientific connectors and prompt patterns adapted into `src/runtime/tools/` and `src/runtime/agents/`.

### `K-Dense-AI/scientific-agent-skills`
- **Repository URL:** https://github.com/K-Dense-AI/scientific-agent-skills
- **Pinned Commit:** `36d8f13a1e754618794bf42f417884940077b4ae`
- **License:** MIT License
- **Copyright:** Copyright (c) 2026 K-Dense AI
- **Role in JunScience:** Comprehensive scientific domain skill library (Bioinformatics, Cheminformatics, Genomics, Statistics, ML).
- **Integration Status:** Curated Tier 0, Tier 1, and Tier 2 skills cataloged into `src/runtime/skills/`.

---

## 2. Adaptation Guidelines & Boundaries

1. **Licensing Compliance:** Attribution and original copyright notices are preserved. Copied or derived code is clearly segregated from JunScience-original product code.
2. **Clean Boundary:** The completed JunScience frontend shell (Milestone 1) is never coupled to upstream internal implementation details; integration occurs via typed event streams.
3. **Reproducibility:** Upstream adaptations prioritize deterministic outputs, explicit provenance, and auditable scientific evidence trails.
