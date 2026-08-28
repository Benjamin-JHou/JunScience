# UPSTREAM_ARCHITECTURE.md — Reconnaissance & Architectural Synthesis

> **Phase 0 Deliverable for Milestone 2 of JunScience**  
> Source-of-truth comparative evaluation of `deepseek-ai/deepseek-harness`, `synthetic-sciences/openscience`, and `K-Dense-AI/scientific-agent-skills`.

---

## 1. Executive Summary & Upstream Mapping

To build **JunScience** as an autonomous, production-quality AI for Science (AI4S) research engine, we inspected the complete source trees of three foundational open-source repositories:

| Repository | Pinned Origin | Primary Role in JunScience | Upstream License |
| :--- | :--- | :--- | :--- |
| **`deepseek-ai/deepseek-harness`** | `github.com/deepseek-ai/deepseek-harness` | **Agent Runtime & Harness Foundation**: Plugin lifecycle (Cordis), event bus, agent loop, tool registry, session persistence, sandbox/permissions, job supervision. | **MIT** |
| **`synthetic-sciences/openscience`** | `github.com/synthetic-sciences/openscience` | **Scientific Capability Layer**: Research loop, specialist agent taxonomy (`research`, `critic`, `plan`), scientific database connectors (PubMed, UniProt, ChEMBL, PDB), evidence/citation model, artifact provenance. | **Apache-2.0** |
| **`K-Dense-AI/scientific-agent-skills`** | `github.com/K-Dense-AI/scientific-agent-skills` | **Scientific Knowledge Library**: 163 curated `SKILL.md` capability modules (Bioinformatics, Cheminformatics, Genomics, ML, Statistics). | **MIT** |

---

## 2. Comparative Architecture Matrix

| Architectural Subsystem | DeepSeek Harness (`dsh`) | OpenScience (`synsci`) | Scientific Agent Skills | JunScience Milestone 2 Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Core Paradigm** | Cordis plugin microkernel ("Everything is a plugin") | Hono server + Bun CLI + SSE stream | Markdown instruction bundles (`SKILL.md`) | **Modular Event-Driven Core**: Plugin registry, typed event bus, scoped tools. |
| **Agent Execution Loop** | Multi-turn tool execution loop with waterfall effects | Sequential turn dispatch with subagent explore/execute | N/A (Instructions only) | **Autonomous Multi-Turn Loop**: Iterative tool calling, observation, reasoning, reflection, streaming. |
| **Agent Taxonomy** | Generalist agent with subagent delegation | `research` (lead), `plan`, `review`, legacy domain profiles | Role-based skill metadata (`pi-agent`, `peer-review`) | **Specialist Agent Registry**: `research` (lead), `biology`, `chemistry`, `ml`, `critic`, `plan`, `literature-reviewer`. |
| **Scientific Connectors** | None (General purpose coding/shell) | Rich connectors in `backend/cli/src/science/connectors` | External API instructions (`gget`, `bioservices`, `depmap`) | **Native Scientific Tool Layer**: PubMed, UniProt, ChEMBL, PubChem, PDB, Ensembl, OpenAlex. |
| **Skill System** | Plugin-based local loader (`packages/skill`) | Versioned tarball materialized to local cache | 163 filesystem folders with `SKILL.md` + metadata | **On-Demand Skill Registry**: Semantic discovery, dependency verification, dynamic prompt injection. |
| **Evidence & Provenance** | Model-visible logged events in session SQLite | Immutable artifact versions + session provenance | Formal citation formatting guidelines | **First-Class Evidence & Citation System**: Full audit trail (dataset → script → output → artifact → DOI citation). |
| **Safety & Sandbox** | Strict permission gates (READ, WRITE, EXECUTE, NETWORK) | Localhost-only server + permission requests | Security notices in `SKILL.md` | **Granular Capability Sandbox**: Explicit approval for package installs, destructive actions, and shell commands. |
| **Frontend Contract** | ACP (Agent Client Protocol) / JSON-RPC | Hono SSE event stream (`/api/session/:id/events`) | N/A | **Stable Typed Event Contract**: Binds directly to the completed Milestone 1 frontend shell. |

---

## 3. Components to Reuse, Adapt, and Reject

### A. From `deepseek-ai/deepseek-harness`

#### Reusable & Adaptable:
1. **Event-Driven Agent Loop**: Adopt the multi-turn loop supporting iterative tool dispatch, progress streaming, error diagnosis, and termination conditions.
2. **Central Tool Registry**: Adopt typed tool definitions with JSON schema input/output, permission metadata, and execution handlers.
3. **Session Event Architecture**: Model-visible ⟺ logged. Every action, tool call, artifact creation, and thought is captured in structured events.
4. **Safety & Permission Seams**: Formal operation categories (`READ`, `WRITE`, `EXECUTE`, `NETWORK`, `INSTALL`, `DELETE`) with approval interceptors.
5. **Replaceable Model Providers**: Abstract `ModelProvider` contract supporting DeepSeek, OpenAI, Anthropic, Google, and local backends.

#### Rejected:
- Monolithic monorepo build tools (`oxlint`, `knip`, `lefthook` complex setup) that would complicate the standalone JunScience workstation.
- CJS shims and platform-specific native addons (`node-addon-landlock-run`).

---

### B. From `synthetic-sciences/openscience`

#### Reusable & Adaptable:
1. **Scientific Research Loop**: `Plan → Search → Read → Hypothesize → Execute → Analyze → Critique → Revise → Report`.
2. **Scientific Database Connectors**: REST/GraphQL integration patterns for PubMed, bioRxiv, Europe PMC, UniProt, ChEMBL, PDB, Ensembl, and OpenAlex.
3. **Specialist Research Prompts**: Domain-tuned system prompts that enforce scientific rigor, statistical significance testing, and control verification.
4. **First-Class Scientific Artifacts**: Typed structures for volcano plots, gene tables, 3D AlphaFold models, and chemical descriptors with metadata.
5. **Evidence & Citation Model**: Exact citation indexing (`[1]`, DOI, journal, authors, abstract, evidence excerpts).

#### Rejected:
- Proprietary Synthetic Sciences Gateway dependencies (Ace credits, wallet synchronization, `thk_` tokens).
- SolidJS workspace UI (JunScience's React/Tailwind frontend shell is the visual and functional authority).

---

### C. From `K-Dense-AI/scientific-agent-skills`

#### Reusable & Adaptable:
1. **Curated Skill Taxonomy**:
   - **Tier 0 (Core)**: `literature-review`, `database-lookup`, `hypothesis-generation`, `statistical-analysis`, `scientific-visualization`, `scientific-writing`, `citation-management`, `peer-review`.
   - **Tier 1 (High-Value Biology & Chemistry)**: `biopython`, `scanpy`, `pydeseq2`, `anndata`, `rdkit`, `deepchem`, `scikit-learn`, `pytorch-lightning`.
   - **Tier 2 (Specialized)**: `diffdock`, `molecular-dynamics`, `scvelo`, `torchdrug`.
2. **Metadata & Dependency Schema**: Parse YAML frontmatter to verify Python dependencies (`rdkit`, `scanpy`, `pandas`) before execution.

#### Rejected:
- Indiscriminate bulk loading of all 163 skills into system prompt context (which would exceed token limits and cause hallucinations).

---

## 4. Licensing & Attribution Notice

- **DeepSeek Harness**: Released under the **MIT License**. Copyright (c) 2026 DeepSeek AI.
- **OpenScience**: Released under the **Apache License 2.0**. Copyright (c) Synthetic Sciences Inc.
- **Scientific Agent Skills**: Released under the **MIT License**. Copyright (c) 2026 K-Dense AI.

All adapted code, connectors, prompts, and skills will be properly attributed in `UPSTREAM.md` with source repository URLs, commit hashes, and licensing statements.

---

## 5. JunScience Target Architecture (Milestone 2)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JunScience Product Shell (Milestone 1)                    │
│   Desktop Dark / Light  •  CLI (Green/Blue/Purple/Amber)  •  Agent Workspace │
└──────────────────────────────────────▲──────────────────────────────────────┘
                                       │ Typed Event Bus (SSE / Local RPC)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    JunScience Scientific Agent Runtime                      │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                            Core Runtime                               │  │
│  │  EventBus  •  AgentLoop  •  SessionManager  •  PermissionManager      │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │                         Specialist Agents                             │  │
│  │  Research (Lead)  •  Biology  •  Chemistry  •  ML  •  Critic  •  Plan  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │                         Scientific Tool Layer                         │  │
│  │  • Literature Search (PubMed, bioRxiv, Europe PMC, OpenAlex)          │  │
│  │  • Database Connectors (UniProt, ChEMBL, PubChem, PDB, Ensembl)       │  │
│  │  • Code Execution (Sandboxed Python, Scanpy, RDKit, NumPy, Pandas)    │  │
│  │  • Visualization & Artifacts (Volcano, Tables, 3D Protein Structures) │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │                         Scientific Skill Registry                     │  │
│  │  Tier 0: Core Research  •  Tier 1: Bio/Chem/ML  •  Tier 2: Specialized │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │                         Model Provider Layer                          │  │
│  │  DeepSeek  •  OpenAI  •  Anthropic  •  Google  •  Scientific Mock     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```
