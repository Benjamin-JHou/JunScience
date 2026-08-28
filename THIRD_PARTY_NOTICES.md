# Third-Party Software Notices & Acknowledgements

This document lists the open-source software and architectural patterns referenced and adapted within **JunScience**.

---

## 1. Synthetic Sciences — OpenScience
- **Project URL:** https://github.com/synthetic-sciences/openscience
- **License:** Apache License 2.0 (Copyright 2025 Synthetic Sciences Inc.)
- **Referenced Modules:**
  - Scientific database connectors (`UniProtKB`, `RCSB PDB`, `PubChem`, `ChEMBL`, `PubMed`)
  - Polite HTTP rate-limiting, retry with exponential backoff, and caching patterns (`packages/core/src/utils/httpClient.ts`)
  - RCSB PDB Search API v2 query integration (`packages/core/src/tools/databases/PDBTool.ts`)
  - Two-stage PubChem chemical lookup pattern (`packages/core/src/tools/databases/PubChemTool.ts`)

---

## 2. DeepSeek AI — DeepSeek Harness
- **Project URL:** https://github.com/deepseek-ai/deepseek-harness
- **License:** MIT License (Copyright 2026 DeepSeek)
- **Referenced Modules:**
  - ReAct agent event stream patterns and structured tool calling execution loop
  - Memory compaction and context budget management principles

---

## 3. Mario Zechner — Pi Agent Core
- **Project URL:** https://github.com/earendil-works/pi
- **License:** MIT License (Copyright 2025 Mario Zechner)
- **Referenced Modules:**
  - Minimalist agent harness principles and streaming steering interfaces

---

## 4. OpenAI — Codex
- **Project URL:** https://github.com/openai/codex
- **License:** Apache License 2.0 (Copyright 2025 OpenAI)
- **Referenced Modules:**
  - Model Context Protocol (MCP) tool dispatch patterns and thread event streaming models
