# Agent.md — JunScience Scientific Agent Runtime & Research Engine

> **Purpose:** This document is the single source of truth for building the JunScience Agent runtime and scientific capability layer.
>
> **Important:** The JunScience frontend shell has already been implemented. This task is the **second major milestone**: turn JunScience from a polished frontend into a real, extensible AI4S research agent.
>
> The implementation must study, adapt, and integrate ideas/components from:
>
> 1. `deepseek-ai/deepseek-harness` — agent runtime / harness foundation
> 2. `synthetic-sciences/openscience` — scientific research workflows, agents, tools, databases, workspace-oriented research capabilities
> 3. `K-Dense-AI/scientific-agent-skills` — production-ready scientific Agent Skills
>
> Do not blindly copy these repositories. **Study them, understand their architecture, select the strongest ideas, adapt them to JunScience, and preserve clean boundaries.**

---

# 1. Mission

Build **JunScience** as a production-quality AI4S (AI for Science) agent.

JunScience should eventually behave like:

> **Claude Code / Codex + OpenScience + a scientific computing environment**

but with its own identity and architecture.

The target experience is:

```text
Scientist
   ↓
JunScience Agent
   ↓
Plan / Reason / Delegate
   ↓
Scientific Skills + Tools + Databases + Code + Shell
   ↓
Experiments / Analysis / Literature / Computation
   ↓
Artifacts + Evidence + Citations + Reproducible Results
```

JunScience is NOT a generic chatbot.

It is a **research execution system**.

The agent must be able to:

- understand scientific questions
- inspect literature
- formulate research plans
- search scientific databases
- read local research files
- write and execute code
- analyze datasets
- generate figures
- use scientific Python packages
- perform bioinformatics / computational biology workflows
- work with chemistry and molecular data
- use external scientific tools through MCP/API/connectors where appropriate
- maintain project/session context
- produce reproducible research artifacts
- cite sources and distinguish evidence from inference
- delegate work to specialized scientific sub-agents when useful

---

# 2. Non-Negotiable Architectural Principle

## The Agent Runtime must be modular and plugin-oriented.

Use the architecture philosophy of DeepSeek Harness:

> **Everything is a plugin.**

DeepSeek Harness is built around Cordis, where capabilities register services, tools, events, and effects into a shared runtime context.

JunScience should adopt this philosophy rather than creating a giant monolithic `agent.ts`.

Reference architecture to study:

- DeepSeek Harness architecture
- Cordis plugin model
- agent loop
- scoped tools
- session events
- system-prompt assembly
- skill registry
- plugin lifecycle
- sandbox / approval mechanisms

The exact implementation does NOT have to be identical to DeepSeek Harness.

The goal is to preserve its strongest architectural property:

```text
Core Runtime
    +
Plugins
    +
Skills
    +
Tools
    +
Providers
    +
Events
    +
Agents
```

New scientific functionality should normally be addable without rewriting the core agent loop.

---

# 3. Required Source Repositories

Before making architectural decisions, clone and inspect these repositories.

```bash
gh repo clone deepseek-ai/deepseek-harness
gh repo clone synthetic-sciences/openscience
gh repo clone K-Dense-AI/scientific-agent-skills
```

Use local copies for detailed source inspection.

Do not rely only on README files.

Read:

- architecture documentation
- agent implementation
- tool system
- skill system
- provider/model abstraction
- session/event system
- plugin system
- CLI
- workspace integration
- scientific tools
- database connectors
- agent definitions
- relevant tests

Create an internal architecture comparison before implementing major changes.

---

# 4. Source-of-Truth Responsibilities

Each upstream project has a different role.

## DeepSeek Harness

Primary source for:

- agent runtime architecture
- plugin architecture
- event-driven runtime
- session model
- tool registry
- model/provider abstraction
- agent loop
- command system
- jobs/background work
- filesystem/shell abstractions
- sandbox and approval concepts
- scoped agent capabilities
- CLI/headless execution

Do NOT fork the entire product blindly.

Use it as the **runtime architecture reference and foundation**.

---

## OpenScience

Primary source for:

- scientific research loop
- research-agent architecture
- specialist agents
- literature workflow
- scientific database integrations
- scientific tools
- research planning
- critique / literature-review sub-agents
- scientific workspace concepts
- scientific artifact rendering
- scientific skill organization
- MCP integrations
- research-oriented prompts

OpenScience currently describes a research loop covering literature, hypotheses, code, experiments, analysis, and write-up.

JunScience should adopt this research-loop philosophy.

---

## Scientific Agent Skills

Primary source for:

- scientific skill definitions
- scientific package instructions
- database workflows
- reproducible scientific procedures
- domain-specific best practices
- examples
- scientific tool usage patterns

The current repository contains a large collection of scientific skills spanning areas such as:

- scientific databases
- bioinformatics
- genomics
- transcriptomics
- proteomics
- cheminformatics
- molecular dynamics
- protein engineering
- machine learning
- statistics
- scientific visualization
- literature
- scientific writing
- document processing
- laboratory automation
- research methodology

Use the repository as the **scientific capability library**.

---

# 5. Do Not Blindly Vendor Everything

Do NOT simply copy 100% of OpenScience and 100% of Scientific Agent Skills into JunScience.

Instead create a layered capability model.

```text
JunScience Core
│
├── Agent Runtime
├── Session Runtime
├── Tool Runtime
├── Model Providers
├── Event Bus
├── Permissions / Sandbox
│
├── Scientific Agent Layer
│   ├── Research Agent
│   ├── Biology Agent
│   ├── Chemistry Agent
│   ├── Physics Agent
│   ├── ML Agent
│   └── Critic / Reviewer Agent
│
├── Scientific Tool Layer
│   ├── Literature
│   ├── Databases
│   ├── Data Analysis
│   ├── Code Execution
│   ├── Visualization
│   ├── Molecules
│   ├── Proteins
│   └── Documents
│
├── Skill Layer
│   ├── Built-in Skills
│   ├── Project Skills
│   └── User Skills
│
└── External Extensions
    ├── MCP
    ├── APIs
    └── Plugins
```

---

# 6. Agent Runtime

Implement a robust Agent runtime.

At minimum the runtime must support:

```text
Agent
Session
Turn
Message
ToolCall
ToolResult
Artifact
Skill
Task
Job
Citation
Event
```

Recommended lifecycle:

```text
User Request
     ↓
Context Assembly
     ↓
Planning
     ↓
Agent Loop
     ↓
Tool / Skill Selection
     ↓
Execution
     ↓
Observation
     ↓
Reasoning
     ↓
Additional Tool Calls
     ↓
Result Synthesis
     ↓
Artifact + Citation + Provenance
```

The loop must support multiple tool calls per turn.

It must support iterative reasoning based on tool results.

It must support cancellation.

It must support errors and recovery.

It must support streaming.

---

# 7. Event-Driven Runtime

Use typed events instead of hard-coded callbacks wherever practical.

The runtime should support events conceptually similar to:

```text
session/created
session/resumed
session/event
session/closed

agent/created
agent/pre-step
agent/request
agent/response
agent/turn-start
agent/turn-stopping
agent/turn-completed
agent/error

llm/request
llm/stream
llm/completed
llm/error

tool/pre-execute
tool/started
tool/progress
tool/completed
tool/error

skill/discovered
skill/loaded
skill/executed
skill/error

artifact/created
artifact/updated

citation/created

job/created
job/progress
job/completed
job/failed
job/cancelled
```

The exact event naming may be adapted to the existing codebase.

Important:

- events should be typed
- lifecycle should be observable
- session events required for replay should be durable
- ephemeral UI events should not necessarily be persisted

---

# 8. Session Model

Sessions are first-class objects.

A session should contain:

- session ID
- project ID
- agent ID
- messages/events
- active model
- active tools
- active skills
- environment information
- artifacts
- citations
- task state
- timestamps
- provenance

Sessions must be resumable.

The Agent should be able to continue a research task after restarting the application.

Avoid storing the entire state only in frontend memory.

---

# 9. Projects

JunScience should support persistent research projects.

Conceptually:

```text
Project
├── project metadata
├── sessions
├── files
├── datasets
├── notebooks
├── skills
├── citations
├── artifacts
├── analyses
├── experiments
└── research history
```

A project is the long-lived research environment.

A session is one conversational / execution trajectory inside the project.

---

# 10. Agent Types

Implement an extensible agent registry.

Initial built-in agents:

## `research`

Default general scientific research agent.

Responsibilities:

- understand research questions
- literature review
- hypothesis generation
- planning
- tool orchestration
- synthesis
- scientific writing

---

## `biology`

Specialist for:

- genomics
- transcriptomics
- single-cell
- proteomics
- systems biology
- molecular biology
- bioinformatics

---

## `chemistry`

Specialist for:

- molecules
- cheminformatics
- drug discovery
- molecular descriptors
- docking
- molecular dynamics
- chemical databases

---

## `physics`

Specialist for:

- physical modeling
- simulation
- numerical analysis
- scientific computation

---

## `ml`

Specialist for:

- machine learning
- deep learning
- scientific ML
- model training
- evaluation
- dataset workflows

---

## `critic`

Scientific critique agent.

Responsibilities:

- identify unsupported claims
- check reasoning
- inspect methodology
- identify missing controls
- identify statistical weaknesses
- challenge conclusions

---

## `literature-reviewer`

Focused literature-analysis sub-agent.

Responsibilities:

- search
- retrieve
- compare
- summarize
- classify
- identify consensus/conflict
- extract evidence

---

## `plan`

Read-only planning agent.

It should produce:

- objectives
- assumptions
- required inputs
- steps
- tools
- expected outputs
- risks

It should NOT execute destructive operations.

---

# 11. Agent Delegation

The primary research agent should be able to delegate work.

Example:

```text
research
   ├── literature-reviewer
   ├── biology
   ├── chemistry
   ├── ml
   └── critic
```

Delegated agents should operate within controlled scopes.

The parent agent should receive structured results.

Do not simply dump child-agent transcripts into the parent context.

Use structured delegation results:

```json
{
  "agent": "literature-reviewer",
  "objective": "...",
  "status": "completed",
  "findings": [],
  "evidence": [],
  "citations": [],
  "artifacts": [],
  "limitations": []
}
```

---

# 12. Model Provider Architecture

Model providers must be replaceable.

Support an abstraction similar to:

```text
ModelProvider
├── listModels()
├── capabilities()
├── generate()
├── stream()
└── estimateCost()
```

The runtime should not assume one model vendor.

Potential providers:

- OpenAI
- Anthropic
- Google
- DeepSeek
- OpenRouter
- local models
- compatible OpenAI-style endpoints

Provider-specific code must stay behind the provider abstraction.

---

# 13. Scientific Skill System

Implement a first-class Skill Registry.

A skill should contain:

```text
SKILL.md
metadata
instructions
examples
references
dependencies
```

Skills are **instructional capability modules**, not merely Python packages.

A skill teaches the Agent:

- when to use something
- how to use it
- expected inputs
- expected outputs
- best practices
- common mistakes
- citation expectations

Skills should be loaded **on demand**.

Do not inject all scientific skill contents into every system prompt.

---

# 14. Scientific Agent Skills Integration

Clone:

```bash
gh repo clone K-Dense-AI/scientific-agent-skills
```

Inspect every skill's:

- `SKILL.md`
- metadata
- dependencies
- required credentials
- external network requirements
- security implications
- scientific domain
- usefulness to JunScience

Then create a curated built-in skill set.

Do not blindly mark every skill as "always loaded".

---

# 15. Built-in Skill Categories

The following categories should be available out of the box.

## Tier 0 — Core Research Skills

These should be built into every JunScience installation.

Recommended:

- literature review
- scientific search
- scientific database lookup
- scientific reasoning / hypothesis generation
- statistical analysis
- data analysis
- scientific visualization
- scientific writing
- citation management
- research planning
- paper/document processing
- reproducibility / provenance

These are foundational.

---

# 16. Tier 1 — High-Value Scientific Skills

Enable by default or make immediately available:

### Biology

- BioPython
- genomics
- transcriptomics
- single-cell analysis
- proteomics
- pathway analysis
- network biology
- protein sequence analysis
- protein structure workflows

### Chemistry

- RDKit
- cheminformatics
- molecular property analysis
- drug discovery
- molecular docking
- molecular dynamics
- chemical database search

### Machine Learning

- scikit-learn
- PyTorch
- PyTorch Lightning
- scientific ML
- model evaluation
- dataset analysis

### Scientific Computing

- NumPy
- SciPy
- pandas
- matplotlib
- NetworkX
- Jupyter / notebook workflows

---

# 17. Tier 2 — Specialized Skills

Do not load these by default.

Make them discoverable and installable / activatable:

- advanced molecular dynamics
- RNA velocity
- specialized omics workflows
- quantum computing
- geospatial science
- time-series forecasting
- laboratory automation
- LIMS
- clinical research
- advanced protein engineering
- specialized materials science
- specialized physics workflows

The Agent should activate them when the task requires them.

---

# 18. Scientific Database Layer

OpenScience demonstrates the value of direct scientific database connectors.

JunScience should build a unified scientific database interface.

At minimum design for:

```text
PubMed
PubChem
ChEMBL
UniProt
PDB
Ensembl
OpenAlex
Semantic Scholar
arXiv
ClinicalTrials.gov
COSMIC
NCBI
KEGG
STRING
```

The exact initial set can be prioritized based on the upstream implementations.

The architecture must allow additional databases to be added as plugins.

---

# 19. Database Tool Contract

Scientific database tools should return structured results.

Example:

```json
{
  "source": "PubMed",
  "query": "...",
  "results": [],
  "total": 123,
  "retrieved_at": "...",
  "citations": []
}
```

Do not return raw HTML to the Agent when structured extraction is possible.

Each database tool should expose:

- search
- retrieve
- metadata
- pagination
- rate-limit handling
- errors
- provenance

---

# 20. Literature System

Literature search is a core JunScience capability.

The Agent should be able to:

1. formulate search queries
2. search multiple scholarly sources
3. retrieve metadata
4. retrieve abstracts/full text where legally available
5. deduplicate results
6. rank relevance
7. extract claims
8. compare studies
9. identify methodological differences
10. produce citations
11. maintain evidence provenance

The system should distinguish:

```text
Discovered
Retrieved
Read
Analyzed
Cited
```

Do not claim to have read a paper if only its metadata or abstract was retrieved.

---

# 21. Evidence Model

Scientific answers must be evidence-aware.

Introduce a concept of:

```text
Evidence
├── source
├── claim
├── excerpt / location
├── confidence
├── evidence type
└── provenance
```

Possible evidence types:

- primary paper
- review
- database record
- official documentation
- user-provided data
- computational result
- model inference
- hypothesis

The Agent should clearly distinguish evidence from speculation.

---

# 22. Citation & Provenance

Citations are first-class artifacts.

Every external scientific source used in a meaningful answer should be traceable.

Store:

- title
- authors
- source
- DOI if available
- URL if available
- retrieval date
- citation key
- relevant claim
- evidence location

Computational results should also have provenance:

```text
dataset
→ code
→ environment
→ parameters
→ execution
→ result
→ artifact
```

---

# 23. Code Execution

JunScience must support real code execution.

The runtime should provide controlled execution for:

- Python
- shell
- optionally R
- optionally Julia

Scientific code execution should support:

- stdout
- stderr
- exit code
- execution time
- generated files
- plots
- tables
- logs

Example:

```text
Agent
  ↓
Generate analysis.py
  ↓
Run in sandbox
  ↓
Capture output
  ↓
Inspect result
  ↓
Generate plot
  ↓
Store artifact
  ↓
Explain result
```

Never allow unrestricted destructive host execution by default.

---

# 24. Sandbox & Permissions

Adopt the strongest safety mechanisms from DeepSeek Harness.

Operations should be classified.

Example:

```text
READ
WRITE
EXECUTE
NETWORK
INSTALL
DELETE
```

Default policy:

- read project files: allowed
- write project files: allowed within project
- execute scientific code: controlled
- network access: policy-controlled
- package installation: approval-controlled
- destructive operations: explicit approval

The Agent should explain what it is requesting permission to do.

---

# 25. Scientific Environment

The Agent should understand the local computational environment.

It should be able to inspect:

- Python version
- installed packages
- CUDA availability
- GPU
- CPU
- RAM
- disk
- OS
- environment manager
- project dependencies

It should prefer existing environments before installing unnecessary packages.

---

# 26. Package Management

Use a safe scientific package strategy.

Prefer:

```text
uv
```

where appropriate.

The Agent should inspect dependency requirements from skills before installation.

Avoid blindly installing packages.

Before package installation:

1. determine whether package is already installed
2. inspect project environment
3. identify compatible version
4. explain why installation is needed
5. install into appropriate environment
6. record dependency change

---

# 27. Scientific Artifact System

Artifacts are first-class outputs.

Support at least:

```text
Figure
Table
Dataset
CSV
JSON
Markdown
PDF
DOCX
PPTX
Notebook
Code
Log
Model
Structure
Molecule
Genome
Report
```

Artifacts should have:

- ID
- type
- path
- created_at
- producing task
- producing tool
- provenance
- preview metadata

---

# 28. Plot / Figure Handling

Scientific figures are especially important.

The Agent should be able to:

- create plots
- inspect plots
- revise plots
- export high-resolution figures
- create publication-oriented figures
- explain plotted results

Prefer deterministic and reproducible plotting code.

Store the source code used to generate important figures.

---

# 29. Notebook Integration

Support scientific notebooks.

The Agent should eventually be able to:

- create notebook
- open notebook
- edit cells
- execute cells
- inspect outputs
- recover errors
- export results

Notebook execution should use the same execution and provenance layer as normal code execution.

---

# 30. MCP / External Tool Layer

JunScience should support MCP-style external tools.

Architecture:

```text
JunScience
    ↓
MCP Manager
    ↓
MCP Server
    ↓
External Scientific Capability
```

MCP tools must be:

- discoverable
- permission-controlled
- scoped
- observable
- removable

Do not make MCP servers special cases in the agent loop.

Treat them as another tool provider.

---

# 31. Skill / Tool / Plugin Distinction

Keep these concepts separate.

## Skill

Instructional knowledge.

Example:

> How to perform RNA-seq analysis correctly.

## Tool

Executable capability.

Example:

> Run Scanpy.

## Plugin

Runtime extension.

Example:

> Add a PubChem connector.

## Agent

Reasoning/execution identity.

Example:

> Biology Agent.

A skill may teach the Agent how to use a tool.

A plugin may register the tool.

An agent chooses when to use it.

---

# 32. Tool Registry

Implement a central tool registry.

Each tool should expose:

```text
name
description
inputSchema
outputSchema
permissions
provider
availability
execute()
```

Tool schemas should be model-readable.

Tools should be discoverable by skill/agent scope.

---

# 33. Tool Selection

Do not expose hundreds of tools to the model indiscriminately.

Use layered tool discovery.

```text
Core tools
   ↓
Relevant skills
   ↓
Relevant tool subset
   ↓
Agent decision
```

This reduces context size and improves tool selection.

---

# 34. Skill Discovery

Use semantic / metadata-driven skill discovery.

Each skill should have:

```yaml
name:
description:
category:
version:
author:
dependencies:
required_environment_variables:
```

At runtime:

```text
User task
   ↓
Skill discovery
   ↓
Top relevant skills
   ↓
Load SKILL.md
   ↓
Expose related tools
```

---

# 35. Built-in vs Optional Skills

Use three states:

```text
builtin
available
disabled
```

Built-in skills are available immediately.

Available skills can be activated when needed.

Disabled skills require explicit user action.

Do not require the user to manually install fundamental scientific capabilities.

---

# 36. Skills Provenance

Every bundled skill must preserve provenance.

Record:

- upstream repository
- upstream skill name
- version / commit
- license
- local adaptation status
- dependency list

Example:

```text
source:
  repository: K-Dense-AI/scientific-agent-skills
  skill: rdkit
  version: ...
  commit: ...
  license: MIT
  adapted: true
```

Do not remove upstream attribution.

---

# 37. License Compliance

Respect all upstream licenses.

Before integrating code:

1. inspect license
2. preserve attribution
3. preserve notices
4. record source commit/version
5. distinguish copied code from JunScience-original code

Do not silently copy incompatible code.

DeepSeek Harness currently uses MIT licensing.

OpenScience currently uses Apache-2.0.

Scientific Agent Skills currently uses MIT licensing.

Always verify the actual checked-out license files rather than relying on this document.

---

# 38. Upstream Tracking

Do not make upstream code impossible to update.

Maintain:

```text
upstream/
├── deepseek-harness
├── openscience
└── scientific-agent-skills
```

or equivalent Git remotes/submodules/vendor snapshots, depending on the final architecture.

Maintain an `UPSTREAM.md` documenting:

- repository
- URL
- pinned commit
- local adaptations
- license
- integration status

---

# 39. Recommended Repository Structure

Adapt to the existing project if necessary, but aim for a structure conceptually similar to:

```text
junscience/
│
├── apps/
│   ├── desktop/
│   └── cli/
│
├── packages/
│   ├── agent-core/
│   ├── agent-loop/
│   ├── session/
│   ├── events/
│   ├── models/
│   ├── tools/
│   ├── skills/
│   ├── plugins/
│   ├── sandbox/
│   ├── provenance/
│   ├── artifacts/
│   ├── databases/
│   ├── literature/
│   └── scientific-runtime/
│
├── agents/
│   ├── research/
│   ├── biology/
│   ├── chemistry/
│   ├── physics/
│   ├── ml/
│   └── critic/
│
├── skills/
│   ├── builtin/
│   ├── scientific/
│   └── project/
│
├── plugins/
│   ├── literature/
│   ├── databases/
│   ├── mcp/
│   └── scientific/
│
├── docs/
│
├── tests/
│
├── scripts/
│
├── UPSTREAM.md
└── Agent.md
```

Do not restructure the already-working frontend unnecessarily.

Integrate the runtime cleanly behind the existing frontend shell.

---

# 40. Frontend ↔ Agent Contract

The frontend already exists.

Do not redesign the UI.

Connect the UI to the Agent runtime through a stable event/RPC contract.

The frontend should consume events such as:

```text
session.created
agent.started
agent.thinking
agent.message.delta
agent.message.completed
tool.started
tool.progress
tool.completed
tool.error
artifact.created
citation.created
task.completed
task.failed
```

The exact naming can be adapted to the existing frontend implementation.

The important requirement is:

> **Frontend must not know how the Agent internally reasons.**

The frontend observes Agent events and renders them.

---

# 41. Agent Streaming

Streaming must be first-class.

Support:

- token streaming
- tool progress
- status updates
- intermediate artifacts
- long-running jobs

The frontend should be able to show:

```text
Thinking...
Searching literature...
Reading 18 papers...
Running Python...
Generating figure...
Synthesizing results...
```

without requiring a page refresh.

---

# 42. Long-Running Research Tasks

Scientific tasks can take minutes or hours.

Implement jobs.

Example:

```text
Job
├── ID
├── status
├── progress
├── logs
├── owner session
├── cancellation
├── artifacts
└── result
```

The Agent must be able to start a job and continue observing it.

Jobs should survive temporary frontend disconnects.

---

# 43. Background Research

Eventually support:

```text
research job
   ↓
background execution
   ↓
periodic progress
   ↓
artifact creation
   ↓
notification
   ↓
session resume
```

Do not implement a fragile "single request = entire research task" model.

---

# 44. Research Workflow

The default research agent should understand this loop:

```text
Question
 ↓
Clarify
 ↓
Plan
 ↓
Literature Search
 ↓
Evidence Collection
 ↓
Hypothesis
 ↓
Data / Code / Experiment
 ↓
Analysis
 ↓
Critique
 ↓
Revision
 ↓
Synthesis
 ↓
Report / Artifacts
```

Not every task needs every step.

The Agent should adapt the workflow to the task.

---

# 45. Scientific Method Guardrails

For scientific tasks, the Agent should:

- state assumptions
- distinguish observations from interpretations
- avoid fabricating references
- avoid inventing experimental results
- report uncertainty
- identify limitations
- preserve provenance
- prefer reproducible computations
- identify statistical caveats
- suggest controls when relevant
- clearly distinguish computational prediction from experimental validation

---

# 46. Hallucination Prevention

Never fabricate:

- papers
- DOI
- database records
- experimental results
- statistical values
- tool outputs
- dataset contents
- citations

If a source cannot be verified:

```text
source_status = unverified
```

Do not present it as established evidence.

---

# 47. Scientific Claim Verification

When feasible, high-impact scientific claims should pass through a verification process.

Conceptually:

```text
Draft claim
   ↓
Evidence lookup
   ↓
Source comparison
   ↓
Critic
   ↓
Verified / qualified / rejected
```

The critic agent should be usable as a post-processing stage.

---

# 48. Context Management

Scientific sessions can become extremely long.

Implement:

- context budgeting
- summarization
- compaction
- artifact references
- citation references
- selective tool-result retention
- session checkpoints

Do not keep every large dataset / tool output directly inside the LLM context.

Store large data externally and reference it.

---

# 49. File System Context

The Agent should be project-aware.

It should understand:

```text
project/
├── data/
├── results/
├── figures/
├── scripts/
├── notebooks/
├── papers/
├── reports/
└── models/
```

It should prefer project-relative paths.

It should avoid modifying unrelated files.

---

# 50. Reproducibility

Important scientific workflows should generate a reproducibility record.

Example:

```text
research_run/
├── input/
├── code/
├── environment/
├── parameters.json
├── logs/
├── results/
├── figures/
├── citations.json
└── provenance.json
```

The exact structure may differ.

The principle must remain.

---

# 51. Testing Strategy

Do not consider the Agent complete because a demo works.

Write tests for:

## Runtime

- agent creation
- session creation
- event delivery
- tool registration
- tool execution
- cancellation
- error recovery

## Skills

- skill discovery
- skill loading
- metadata validation
- dependency detection

## Tools

- schema validation
- permission checks
- execution
- timeout
- error handling

## Scientific

- literature retrieval
- database lookup
- citation creation
- artifact generation
- code execution

## Integration

Create end-to-end tests such as:

```text
"Find recent papers about CRISPR base editing and summarize the major limitations."
```

and:

```text
"Load this CSV, perform differential analysis, generate a publication-quality figure, and save the results."
```

and:

```text
"Analyze this molecule using RDKit and summarize its properties."
```

The tests should verify actual structured outputs, not just that the process did not crash.

---

# 52. Security

Scientific agents execute code and access external services.

Treat this as a security-sensitive system.

Implement:

- sandboxing
- permission boundaries
- environment-variable protection
- secret redaction
- network controls
- subprocess controls
- file path restrictions
- approval workflows
- tool allowlists / denylists

Never expose API keys to model context unnecessarily.

Never print secrets into logs.

---

# 53. Observability

Implement structured logs.

At minimum record:

```text
timestamp
session_id
agent_id
task_id
tool
skill
model
duration
status
error
artifact_ids
citation_ids
```

Do not log raw secrets.

Provide a debug mode for developers.

---

# 54. CLI Integration

The CLI UI already has four visual themes:

- Green
- Blue
- Purple
- Amber

Do not rebuild the CLI architecture separately from the Agent runtime.

The CLI should use the same:

```text
Agent
Session
Tool Registry
Skill Registry
Job System
Artifact System
Event System
```

as the desktop application.

Only the presentation layer differs.

---

# 55. Headless Mode

Implement a headless mode suitable for:

```bash
junscience run "Analyze this dataset"
```

and:

```bash
junscience research "Investigate the mechanisms of ..."
```

The same Agent runtime should power:

- Desktop
- CLI
- Headless
- future API

Do not create separate agent implementations for each interface.

---

# 56. Configuration

Support configuration at multiple levels:

```text
Global
Project
Session
Agent
Tool
Skill
```

Higher-specificity configuration should override lower-specificity configuration.

Avoid scattered environment-variable checks throughout the codebase.

Centralize configuration.

---

# 57. Secrets

Provide a credential abstraction.

Support:

```text
OpenAI
Anthropic
Google
DeepSeek
NCBI
Semantic Scholar
Exa
scientific APIs
MCP credentials
```

Do not hard-code secrets.

Do not store plaintext credentials in project repositories.

---

# 58. Dependency Philosophy

Prefer existing dependencies from the chosen foundation when they satisfy requirements.

Do not introduce duplicate libraries without a clear reason.

Before adding a dependency:

1. check whether an existing package already solves it
2. check license
3. check maintenance
4. check security
5. assess bundle/runtime impact

---

# 59. What to Port from OpenScience

Inspect OpenScience carefully and identify components that provide high scientific value.

Prioritize:

1. research agent prompts
2. specialist agent concepts
3. scientific tool layer
4. scientific database connectors
5. literature workflows
6. research planning
7. critique workflows
8. scientific skill loading
9. artifact rendering
10. MCP integration
11. project/workspace concepts
12. scientific domain-specific utilities

Adapt them into JunScience's plugin architecture.

Do not duplicate equivalent runtime systems from both repositories.

---

# 60. What to Port from DeepSeek Harness

Prioritize:

1. Cordis/plugin architecture
2. Agent registry
3. Agent loop
4. Tool registry
5. system prompt assembly
6. session event model
7. scoped agent capabilities
8. jobs
9. shell execution
10. terminal execution
11. sandbox / approval
12. model provider abstraction
13. command system
14. skill registry
15. event-driven extension points

The final JunScience runtime should have one coherent architecture.

---

# 61. What to Port from Scientific Agent Skills

Prioritize high-frequency scientific workflows.

At minimum ensure excellent built-in support for:

```text
Literature
├── literature review
├── paper search
├── citation management
└── scientific writing

Data
├── pandas
├── numpy
├── scipy
├── statistics
└── visualization

Biology
├── BioPython
├── genomics
├── transcriptomics
├── single-cell
├── proteomics
└── protein workflows

Chemistry
├── RDKit
├── chemical databases
├── molecular properties
├── docking
└── molecular dynamics

ML
├── scikit-learn
├── PyTorch
├── PyTorch Lightning
└── scientific ML
```

Then expand into specialized domains.

---

# 62. Do Not Make Skills Monolithic

A skill should not contain an entire scientific application.

Skills should be:

- focused
- composable
- discoverable
- reusable
- versioned

Example:

Good:

```text
rdkit
molecular-docking
chemical-database-lookup
```

Bad:

```text
do-all-chemistry
```

---

# 63. Skill Dependency Resolution

A skill may declare dependencies.

Example:

```yaml
dependencies:
  python:
    - rdkit
    - pandas
  external_services:
    - pubchem
```

The Agent should be able to determine:

```text
Can I execute this skill now?
```

If not:

```text
What is missing?
```

Then provide an actionable recovery path.

---

# 64. Research Memory

Do not treat memory as a giant conversation transcript.

Create structured research memory.

Potential entities:

```text
ResearchQuestion
Hypothesis
Finding
Evidence
Dataset
Experiment
Analysis
Decision
Citation
Artifact
```

The Agent can retrieve relevant memory later.

---

# 65. Knowledge Base

Project knowledge should support:

- papers
- PDFs
- notes
- datasets
- reports
- protocols
- code
- previous analyses

The Agent should be able to retrieve relevant project knowledge.

Do not automatically stuff every file into context.

Use retrieval.

---

# 66. Scientific Search Strategy

For external research:

```text
Search
 ↓
Retrieve
 ↓
Rank
 ↓
Deduplicate
 ↓
Inspect
 ↓
Extract evidence
 ↓
Cite
```

Do not treat search snippets as equivalent to reading source documents.

---

# 67. Error Recovery

Scientific computation fails often.

The Agent should recover from:

- Python exceptions
- missing packages
- malformed input
- API errors
- rate limits
- timeout
- memory errors
- GPU errors
- invalid tool parameters

Preferred loop:

```text
Error
 ↓
Inspect
 ↓
Diagnose
 ↓
Repair
 ↓
Retry
```

Retry must have bounded attempts.

Do not enter infinite repair loops.

---

# 68. Long-Term Goal

JunScience should eventually be able to execute a request such as:

> "Investigate whether pathway X contributes to disease Y. Review the literature, identify candidate genes, retrieve public datasets, analyze them, compare the evidence, generate figures, and prepare a research report with citations."

The Agent should autonomously orchestrate:

```text
Literature Agent
      ↓
Database Tools
      ↓
Biology Skills
      ↓
Data Analysis
      ↓
Python Execution
      ↓
Figures
      ↓
Critic
      ↓
Scientific Report
```

This is the benchmark for the architecture.

---

# 69. Development Order

Implement in this order.

## Phase 0 — Reconnaissance

Clone and study all three repositories.

Produce:

```text
docs/UPSTREAM_ARCHITECTURE.md
```

containing:

- architecture comparison
- components to reuse
- components to adapt
- components to reject
- licensing notes
- dependency conflicts
- proposed JunScience architecture

Do this before large-scale implementation.

---

## Phase 1 — Runtime Foundation

Implement:

- Agent
- Session
- Event Bus
- Agent Loop
- Model Provider
- Tool Registry
- Skill Registry
- Artifact Registry
- Job System
- Permission/Sandbox layer

---

## Phase 2 — Scientific Layer

Implement:

- Research Agent
- Biology Agent
- Chemistry Agent
- ML Agent
- Critic
- Literature Reviewer
- Plan Agent

---

## Phase 3 — Scientific Skills

Integrate curated Scientific Agent Skills.

Start with:

- literature
- database lookup
- data analysis
- statistics
- visualization
- BioPython
- RDKit
- scikit-learn
- PyTorch
- scientific writing

---

## Phase 4 — Scientific Tools

Integrate:

- literature search
- scientific databases
- Python execution
- shell
- notebook
- file operations
- MCP
- molecular tools
- data analysis

---

## Phase 5 — Research Loop

Implement:

```text
Plan
→ Search
→ Read
→ Hypothesize
→ Execute
→ Analyze
→ Critique
→ Revise
→ Report
```

---

## Phase 6 — Frontend Integration

Connect the already-built JunScience UI to:

- sessions
- Agent streaming
- tool execution
- artifacts
- citations
- jobs
- project state

Do not redesign the UI unless required for missing runtime states.

---

## Phase 7 — CLI

Connect the four CLI themes to the same runtime.

---

## Phase 8 — End-to-End Validation

Test real scientific tasks.

---

# 70. Definition of Done

Do not declare the Agent complete until all of the following work.

## Runtime

- [ ] Agent loop works
- [ ] streaming works
- [ ] sessions persist
- [ ] events work
- [ ] tools work
- [ ] skills work
- [ ] jobs work
- [ ] cancellation works
- [ ] errors recover
- [ ] model providers are replaceable

## Scientific

- [ ] literature search works
- [ ] citations work
- [ ] database lookup works
- [ ] Python analysis works
- [ ] scientific visualization works
- [ ] artifacts work
- [ ] scientific skills load
- [ ] specialist agents work
- [ ] critic works

## Safety

- [ ] sandbox exists
- [ ] permissions exist
- [ ] secrets protected
- [ ] network access controlled
- [ ] destructive operations gated

## Product

- [ ] desktop frontend connects to runtime
- [ ] CLI connects to runtime
- [ ] headless execution works
- [ ] projects persist
- [ ] research sessions resume

## Provenance

- [ ] upstream sources documented
- [ ] licenses preserved
- [ ] skill provenance recorded
- [ ] citations traceable
- [ ] computational provenance recorded

---

# 71. Critical Rules for Codex

When implementing this task, follow these rules.

### Rule 1

**Read before rewriting.**

Inspect the current JunScience codebase before making architectural changes.

---

### Rule 2

**Do not destroy the completed frontend.**

The existing UI is a product surface.

Build the Agent runtime behind it.

---

### Rule 3

**Do not build two Agent runtimes.**

Desktop, CLI, and headless must share one Agent core.

---

### Rule 4

**Do not create a monolith.**

Prefer plugins, registries, typed events, and clear interfaces.

---

### Rule 5

**Do not copy code blindly.**

Understand upstream architecture first.

---

### Rule 6

**Do not expose all tools to every Agent.**

Use scoped tools and skill-driven discovery.

---

### Rule 7

**Do not put all skills into every prompt.**

Load skills on demand.

---

### Rule 8

**Do not fake scientific execution.**

If the Agent claims that code ran, it must actually have run.

If the Agent claims that a paper was retrieved, it must actually have retrieved it.

---

### Rule 9

**Do not fabricate scientific evidence.**

Unknown must remain unknown.

---

### Rule 10

**Every important scientific result should be reproducible.**

Keep code, parameters, environment, data references, and provenance.

---

### Rule 11

**Prefer structured events and artifacts over raw text.**

The frontend should render structured Agent state.

---

### Rule 12

**Keep upstream attribution and licenses.**

Maintain `UPSTREAM.md`.

---

# 72. First Command

When Codex starts this task, its first step should be:

```bash
pwd
find . -maxdepth 2 -type f | sort | head -300

gh repo clone deepseek-ai/deepseek-harness
gh repo clone synthetic-sciences/openscience
gh repo clone K-Dense-AI/scientific-agent-skills
```

Then inspect:

```text
DeepSeek Harness
├── README
├── AGENTS.md
├── docs/architecture.md
├── docs/subsystems/
├── packages/
└── relevant agent/plugin code

OpenScience
├── README
├── ARCHITECTURE.md
├── backend/
├── frontend/
├── skills/
└── scientific tools

Scientific Agent Skills
├── README
├── skills/
└── skill metadata / SKILL.md files
```

Do not start implementing major runtime code until the architecture reconnaissance is complete.

---

# 73. Final Product Principle

The goal is not to make JunScience:

> "an AI chatbot with some scientific tools."

The goal is to make JunScience:

> **a programmable scientific research environment powered by an autonomous AI agent.**

The Agent should be able to move naturally between:

```text
Conversation
→ Literature
→ Knowledge
→ Code
→ Data
→ Computation
→ Experiment
→ Visualization
→ Critique
→ Evidence
→ Scientific Writing
```

while maintaining:

```text
Context
+
State
+
Provenance
+
Reproducibility
+
Safety
```

That is the core identity of JunScience.

---

# 74. Success Criterion

A successful implementation should make this command meaningful:

```bash
junscience research "Investigate the role of TAD boundary disruption in autoimmune disease"
```

and the Agent should be architecturally capable of:

```text
1. Plan the research
2. Search literature
3. Retrieve evidence
4. Identify relevant biological entities
5. Query scientific databases
6. Inspect available datasets
7. Write analysis code
8. Execute analysis
9. Generate figures
10. Critique findings
11. Track citations
12. Preserve provenance
13. Produce a structured scientific report
```

The exact scientific workflow will evolve.

The runtime architecture must be strong enough to support that evolution without requiring a rewrite of the core.

**Build the foundation first. Build the science layer second. Build autonomous research workflows third.**
