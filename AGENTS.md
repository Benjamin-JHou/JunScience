# AGENTS.md — JunScience Contributor & AI Agent Guidelines

> **IMPORTANT TARGET AUDIENCE NOTICE**
> 
> This document is strictly for **AI coding assistants and autonomous agents (such as Claude Code, Antigravity, Codex CLI, Cursor, or peer agents) that are inspecting, developing, testing, or maintaining the JunScience codebase itself**.
> 
> This is **NOT** a runtime prompt for JunScience's internal research loop when executing user scientific queries.

---

## 1. Project Overview & Architecture

**JunScience** is an autonomous, open-source scientific and biomedical research workstation and multi-agent framework. It integrates hardened molecular databases, clinical connectors, cross-platform kernel-enforced sandboxes, and formal verification gates to conduct hypothesis-driven, evidence-grounded scientific investigations.

### Monorepo Architecture
```text
JunScience/
├── packages/
│   ├── core/           # Core runtime, ReAct research loop, hooks, tools, skills, sandboxes
│   │   ├── src/
│   │   │   ├── client/         # Multi-model client (OpenAI & Anthropic protocols, Mock provider)
│   │   │   ├── research-loop/  # AutonomousResearchEngine, EvidenceTracker, EvidenceVerifier,
│   │   │   │                   # SubagentTreeEngine, PlanTracker, CritiqueEngine, MemoryCompactor
│   │   │   ├── hooks/          # Non-bypassable guardrails (secret-redaction, evidence-verifier,
│   │   │   │                   # clinical-data-gate, evidence-completeness-check)
│   │   │   ├── tools/          # Hardened molecular & clinical connectors (UniProt, PDB, ChEMBL,
│   │   │   │                   # PubChem, PubMed, ClinicalTrials, openFDA, RxNorm, DailyMed)
│   │   │   ├── skills/         # Bundled SOPs and scientific workflow definitions
│   │   │   ├── sandbox/        # Cross-platform sandbox (macOS Seatbelt, Linux bwrap, Windows)
│   │   │   └── privacy/        # ClinicalDataGate privacy enforcement
│   │   └── tests/      # Core test suites and integration verification
│   ├── cli/            # Interactive REPL, subcommands (`junscience research`, `junscience hooks list`)
│   └── desktop/        # Electron + React + Tailwind desktop application
├── skills/             # Standard OpenScience-compatible SKILL.md repositories
├── docs/               # Architecture schematics, portal assets, documentation
└── public/             # Static web assets for GitHub Pages portal
```

---

## 2. Core Agentic Paradigms

When modifying or expanding the codebase, preserve and adhere to these three core architectural pillars:

1. **Subagent Hypothesis Tree (`SubagentTreeEngine`)**:
   - Explores multiple competing scientific hypotheses in parallel with isolated evidence scopes.
   - Computes empirical multi-factor confidence scores ($S_{\text{seq}}, S_{\text{bio}}, S_{\text{clin}}, S_{\text{lit}}, P_{\text{contradiction}}$) with distinct status classification (`supported`, `inconclusive`, `refuted`).

2. **Pre-Adoption Evidence Verification Gate (`EvidenceVerifier`)**:
   - Codex-style patch verification. No computational or tool output is admitted into the immutable `EvidenceTracker` without passing physical and mathematical boundary tests ($p \in [0, 1]$, $IC_{50} > 0$, $HU \in [-1024, +3071]$, NaN/Inf overflow detection).

3. **Formal Hooks Lifecycle (`HookRegistry`)**:
   - Deterministic, non-bypassable guardrails triggered across four lifecycle events:
     - `PreToolUse`: `secret-redaction` (blocks credential leaks), `clinical-data-gate` (guards EHR/DICOM data).
     - `PostToolUse`: `evidence-verifier` (validates tool outputs).
     - `SessionStart`: loads session context and skill definitions.
     - `Stop`: `evidence-completeness-check` (verifies all cited `[Evidence: EV-xxx]` records exist in tracker).

4. **Explicit Plan Tracker (`PlanTracker`)**:
   - 5-stage research milestones (`TASK-1` to `TASK-5`) streamed to the UI via `EventBus`.

---

## 3. Non-Negotiable Engineering Rules & Invariants

All agents contributing to this codebase **MUST** follow these strict rules:

### A. Scientific Integrity & No Hallucinations
- **NEVER fabricate scientific facts, citations, PMIDs, NCT IDs, or protein sequences**.
- Every claim synthesized by JunScience must be anchored in verified `[Evidence: EV-xxx]` tags.
- Mock providers must use real-world grounded data (e.g. TYK2: P29597, 1187 aa; Deucravacitinib: CID 134821691).

### B. Clinical Privacy & Sandbox Safety
- **Clinical Data Policy**: Raw EHR text and DICOM image volumes must be processed locally inside the kernel-enforced sandbox. Transmission to external API endpoints requires explicit authorization through the `clinical-data-gate` Hook.
- **Sandboxed Execution**: Python execution must default to the sandbox without direct network or host filesystem access.
- **Credential Protection**: Never hardcode, commit, or echo real API keys. All tool invocations must pass the `secret-redaction` Hook.

### C. Branding and Naming
- The framework name is strictly **JunScience**.
- Do **NOT** use Chinese transliterations (such as "君科") anywhere in the user-facing documentation, portal, or code comments.

### D. Documentation Language Conventions
- **README and Documentation**: English-first overview followed by complete Chinese translations where appropriate.
- **Code Comments & Docstrings**: Standard English.

---

## 4. Directory Conventions for Skills & Hooks

### A. Adding a New Hook
1. Place the hook class in [`packages/core/src/hooks/builtin/`](file:///Users/yangzi/Desktop/JunScience_Agent/packages/core/src/hooks/builtin/).
2. Implement the `HookDefinition` interface from [`packages/core/src/hooks/types.ts`](file:///Users/yangzi/Desktop/JunScience_Agent/packages/core/src/hooks/types.ts).
3. Bind the appropriate lifecycle events: `PreToolUse`, `PostToolUse`, `SessionStart`, or `Stop`.
4. Register the hook in [`HookRegistry.ts`](file:///Users/yangzi/Desktop/JunScience_Agent/packages/core/src/hooks/HookRegistry.ts) and export it from `index.ts`.
5. Add automated unit test in [`packages/core/tests/test-hooks-system.ts`](file:///Users/yangzi/Desktop/JunScience_Agent/packages/core/tests/test-hooks-system.ts).

### B. Adding a New Skill
1. Create a TypeScript definition in [`packages/core/src/skills/bundled/`](file:///Users/yangzi/Desktop/JunScience_Agent/packages/core/src/skills/bundled/) implementing `SkillDefinition`.
2. Register the skill in [`SkillRegistry.ts`](file:///Users/yangzi/Desktop/JunScience_Agent/packages/core/src/skills/SkillRegistry.ts).
3. Create the corresponding markdown specification and executable scripts in `skills/<skill-id>/`:
   - `SKILL.md` (YAML frontmatter + description + SOP workflow steps + input/output specification)
   - `scripts/` (reusable Python / statistical computation scripts)
   - `examples/` (real-world run outputs with public datasets)

---

## 5. Development and Testing Commands

```bash
# Build the entire monorepo
npm run build

# Run core verification suites
npx tsx packages/core/tests/test-hooks-system.ts
npx tsx packages/core/tests/test-subagent-tree.ts
npx tsx packages/core/tests/test-evidence-verifier.ts
npx tsx packages/core/tests/test-plan-tracker.ts
npx tsx packages/core/tests/test-medical-connectors.ts

# Inspect registered hooks
junscience hooks list

# Start interactive CLI
junscience
```
