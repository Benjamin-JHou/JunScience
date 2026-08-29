# JunScience — Engineering & Scientific Agent Reality Audit

> This document is an AUDIT SPECIFICATION.
>
> The purpose is NOT to implement new features.
>
> The purpose is to determine the TRUE current state of the JunScience repository before the next major upgrade.
>
> Codex MUST inspect the actual source code, runtime behavior, configuration, tests, dependencies, and upstream integrations.
>
> Do NOT trust previous completion reports, walkthrough documents, TODO lists, comments, or claims of completion without verifying the implementation.

---

# 0. Mission

JunScience is intended to become:

> **A programmable scientific research environment powered by autonomous AI agents.**

The current project has completed an initial frontend shell and an initial Agent/runtime implementation.

The next phase will focus on:

1. User-configurable LLM/API access
2. Real scientific-agent capability rather than a toy/demo workflow
3. Multi-harness runtime support:
   - DeepSeek Harness
   - Pi
   - Codex Harness

Before implementing these upgrades, perform a rigorous reality audit of the current repository.

---

# 1. CRITICAL PRODUCT PRINCIPLE

## JunScience does NOT intend to build a model-provider marketplace.

JunScience should NOT hard-code commercial model vendors into the product architecture as first-class built-in integrations unless technically required for protocol compatibility.

The intended model configuration philosophy is:

> **User-configured API access.**

The user should be able to provide:

- API key
- API base URL
- model name
- optional organization/project identifier
- context limit
- temperature
- max output tokens
- reasoning-related options
- tool-calling capability
- streaming capability
- optional custom headers

Example:

```text
Provider Label:
My Research Model

API Base URL:
https://example.com/v1

API Key:
********

Model:
some-model-name
````

JunScience should then use a generic model/API abstraction.

The product should NOT require a predefined list such as:

```text
OpenAI
Anthropic
DeepSeek
Google
OpenRouter
```

as the primary architecture.

If compatibility adapters are necessary, they should be protocol-oriented rather than vendor-oriented.

For example:

```text
Generic Model Client
        │
        ├── OpenAI-compatible protocol
        ├── Anthropic-compatible protocol
        └── Custom protocol
```

Do NOT assume that JunScience needs:

```text
OpenAIProvider
AnthropicProvider
DeepSeekProvider
GeminiProvider
```

unless the actual implementation requires them.

---

# 2. READ THESE FILES FIRST

Before auditing source code, read:

```text
Frontend_UI.md
Agent.md
UPSTREAM.md
docs/UPSTREAM_ARCHITECTURE.md
walkthrough.md
```

If any of these files do not exist, report that.

Important:

These documents describe INTENDED architecture.

They are NOT proof that the architecture has actually been implemented.

Source code and runtime behavior are the final authority.

---

# 3. INSPECT THE ACTUAL REPOSITORY

Start with:

```bash
pwd

find . -maxdepth 3 -type f | sort | head -500

git status

git log --oneline -20
```

Then identify:

```text
Frontend
Backend
Agent runtime
CLI
API server
Workers
Database
Sandbox
Skills
Tools
Tests
Configuration
Scripts
Upstream repositories
```

Inspect:

```text
package.json
pnpm-lock.yaml / package-lock.json / yarn.lock
pyproject.toml
requirements.txt
Cargo.toml
go.mod
Dockerfile
docker-compose files
.env.example
configuration files
```

Do not modify files during this audit.

---

# 4. REAL VS MOCK CLASSIFICATION

Every major subsystem MUST be classified as one of:

```text
REAL
PARTIAL
MOCK
STUB
FIXTURE-ONLY
DOCUMENTATION-ONLY
NOT IMPLEMENTED
```

Definitions:

## REAL

The functionality executes its intended real operation.

Example:

A literature search performs an actual request to a scientific API, receives real data, parses it, and passes the result to the Agent.

## PARTIAL

A meaningful portion exists but important functionality is missing.

## MOCK

The system returns simulated data instead of performing the actual operation.

## STUB

The interface exists but the real implementation is missing.

## FIXTURE-ONLY

Tests pass using predefined fixtures but no real operation occurs.

## DOCUMENTATION-ONLY

The feature is described but not implemented.

## NOT IMPLEMENTED

No meaningful implementation exists.

Never classify something as REAL merely because:

* a class exists
* a test passes
* a function returns valid-looking data
* a UI displays successful results
* a README claims support

---

# 5. LLM/API CONFIGURATION REALITY CHECK

Determine how the current project obtains model access.

Answer:

### Configuration

* Can a user enter an API key?
* Can a user enter a custom API Base URL?
* Can a user enter a model name?
* Can multiple user-defined model configurations exist?
* Can a configuration be selected per session/project?
* Can different models be assigned to different tasks?
* Can the configuration be stored securely?
* Is the API key ever exposed to the frontend?
* Is the API key logged?
* Is the API key written into plain-text project files?
* Can environment variables be used?
* Can local configuration be used?

### Runtime

Determine:

* Where is the actual HTTP/SDK request made?
* Which library performs the request?
* Is the request actually sent to the configured endpoint?
* Is streaming implemented?
* Is tool/function calling implemented?
* Are tool results returned to the model?
* Can the model perform multiple sequential tool calls?
* Can the Agent continue after tool execution?
* Are errors returned to the model?
* Are retries implemented?
* Are timeouts implemented?
* Are cancellation mechanisms implemented?

### Important

Determine whether the current implementation is:

```text
User-configured generic API
```

or:

```text
hard-coded vendor integration
```

or:

```text
mock model responses
```

or:

```text
incomplete
```

Report exact evidence.

---

# 6. REAL AGENT LOOP CHECK

Determine whether JunScience currently has a genuine LLM-driven Agent loop.

The intended conceptual loop is:

```text
User Request
      ↓
LLM
      ↓
Plan / Decide
      ↓
Tool Call
      ↓
Real Tool Execution
      ↓
Tool Result
      ↓
LLM
      ↓
Next Decision
      ↓
...
      ↓
Final Scientific Result
```

Determine whether this actually happens.

Specifically inspect:

* Agent loop
* prompt construction
* model invocation
* tool selection
* tool execution
* tool result injection
* context management
* iterative reasoning
* stop conditions
* error recovery
* cancellation
* streaming

Critical question:

> Can the Agent choose the next action based on the actual result of the previous action?

If not, it may be a workflow engine rather than an autonomous Agent.

---

# 7. SCIENTIFIC RESEARCH CAPABILITY

Determine whether JunScience can perform a genuine end-to-end scientific task.

Use this conceptual benchmark:

```text
Research Question
↓
Research Planning
↓
Literature Search
↓
Source Retrieval
↓
Evidence Extraction
↓
Hypothesis Formation
↓
Data Acquisition
↓
Code Generation
↓
Code Execution
↓
Statistical Analysis
↓
Visualization
↓
Critique
↓
Revision
↓
Evidence Verification
↓
Scientific Report
```

For every stage classify:

```text
REAL
PARTIAL
MOCK
STUB
MISSING
```

Determine whether each stage is:

```text
LLM-driven
hard-coded
workflow-driven
human-triggered
```

---

# 8. SCIENTIFIC TOOLS AUDIT

Inspect every scientific tool.

At minimum investigate:

```text
Literature Search
PubMed
OpenAlex
bioRxiv
UniProt
ChEMBL
PubChem
PDB
Protein/structure tools
Python execution
Data analysis
Visualization
Notebook
Molecular tools
```

For each tool report:

```text
Tool name
Implementation file
Actual external service
Real network request?
Authentication?
Parsing?
Error handling?
Retry?
Timeout?
Caching?
Provenance?
Agent integration?
Test type?
Production readiness?
```

Important:

A test returning:

```text
{
  "gene": "TP53",
  "score": 0.92
}
```

does NOT prove that the scientific API was actually queried.

Trace the implementation.

---

# 9. PYTHON / COMPUTE REALITY CHECK

Audit Python execution.

Determine:

* Is Python actually executed?
* Which interpreter?
* Which environment?
* Which working directory?
* Can generated files be persisted?
* Can the Agent inspect generated files?
* Can the Agent modify and rerun code?
* Can multiple scripts run sequentially?
* Can processes be cancelled?
* Are CPU limits enforced?
* Are memory limits enforced?
* Are execution time limits enforced?
* Is network access controlled?
* Can packages be installed?
* Is the environment reproducible?
* Are scientific dependencies actually installed?

Test the distinction:

```text
Agent says:
"Python analysis completed."

Question:
Did Python actually execute?
```

If not, mark it as fake/mock.

---

# 10. SCIENTIFIC SKILLS AUDIT

Inspect:

```bash
scientific-agent-skills
```

Determine exactly which skills were incorporated into JunScience.

For each skill determine:

* Is the SKILL.md present?
* Is metadata present?
* Is the skill discoverable?
* Is it loaded dynamically?
* Is it actually injected into the Agent?
* Does it reference real tools?
* Are dependencies installed?
* Can the referenced software actually execute?
* Are external services required?
* Are credentials required?
* Is provenance recorded?
* Is license information preserved?

Pay particular attention to:

```text
BioPython
RDKit
Scanpy
PyDESeq2
PyTorch
scikit-learn
NumPy
SciPy
pandas
matplotlib
NetworkX
Jupyter
```

Do not assume that because a skill exists, its scientific capability exists.

---

# 11. OPENSCIENCE INTEGRATION AUDIT

Inspect the actual OpenScience repository integration.

Determine what was actually migrated/adapted from:

```text
synthetic-sciences/openscience
```

Classify each major component:

```text
Copied
Adapted
Reimplemented
Referenced
Not integrated
```

Inspect:

* research loop
* literature workflows
* specialist agents
* scientific tools
* MCP integrations
* scientific prompts
* planning
* critique
* artifact generation
* workspace concepts

Determine whether JunScience genuinely uses these components or merely contains similar names.

---

# 12. DEEPSEEK HARNESS AUDIT

Inspect:

```text
deepseek-ai/deepseek-harness
```

Determine what was actually adopted.

Inspect:

* plugin architecture
* runtime
* Cordis
* agent loop
* session model
* events
* tool registry
* command system
* jobs
* shell
* filesystem
* sandbox
* approval
* permissions
* CLI
* model interaction

For each:

```text
DeepSeek upstream
↓
JunScience implementation
```

classify:

```text
Directly reused
Adapted
Reimplemented
Inspired only
Not used
```

Do not assume cloning a repository means integration.

---

# 13. AGENT SPECIALIST AUDIT

Inspect all specialist agents.

At minimum:

```text
Research
Literature Reviewer
Biology
Chemistry
ML
Critic
Planner
```

Determine:

* Is each a real Agent?
* Does it have a separate system prompt?
* Can it call tools?
* Can it receive structured tasks?
* Can it return structured results?
* Can the parent Agent delegate?
* Is delegation dynamic?
* Can specialists critique each other?
* Can specialists share artifacts?
* Can the parent Agent synthesize results?

If they are only prompt templates, explicitly state:

```text
Prompt template, not independent Agent.
```

---

# 14. MEMORY / PROJECT / SESSION AUDIT

Determine whether JunScience has:

```text
Conversation memory
Session memory
Project memory
Research memory
Artifact memory
Evidence memory
Long-term memory
```

Distinguish:

```text
saved JSON
```

from:

```text
actual retrievable Agent memory
```

Determine whether the Agent can resume a research task after:

* restarting the application
* closing the UI
* reconnecting later
* changing model configuration

---

# 15. RESEARCH JOB SYSTEM

Determine whether long-running research tasks are truly supported.

A real research system should conceptually support:

```text
Research Job
├── objective
├── plan
├── state
├── Agent events
├── tool calls
├── datasets
├── artifacts
├── citations
├── provenance
├── logs
├── checkpoints
└── final result
```

Determine:

* Can jobs run asynchronously?
* Can jobs continue when the UI is closed?
* Can jobs be resumed?
* Can jobs be cancelled?
* Can jobs recover after failure?
* Can multiple jobs run?
* Is job state persistent?

---

# 16. EVIDENCE / CITATION REALITY

Determine whether citations are genuine.

For every citation system inspect:

* DOI
* PMID
* accession
* URL
* source metadata
* retrieval time
* provenance
* claim-to-source mapping

Critical test:

> Can JunScience identify exactly which source supports a particular scientific claim?

Determine whether citations are:

```text
REAL SOURCE
```

or:

```text
generated-looking citation
```

or:

```text
fixture
```

---

# 17. SCIENTIFIC PROVENANCE

Determine whether important results retain:

```text
Source
Dataset
Tool
Code
Parameters
Environment
Model
Prompt/context where appropriate
Timestamp
Artifact
```

A scientific result should ideally be traceable:

```text
Claim
 ↓
Evidence
 ↓
Source / Dataset
 ↓
Analysis
 ↓
Code
 ↓
Environment
```

Determine what actually exists.

---

# 18. SECURITY AUDIT

Inspect:

* API key handling
* secret storage
* frontend/backend boundary
* shell execution
* Python execution
* filesystem access
* network access
* package installation
* arbitrary command execution
* prompt injection
* malicious papers/documents
* untrusted web content
* SSRF
* data exfiltration
* destructive commands

Classify risks:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

---

# 19. HARNESS ARCHITECTURE AUDIT

JunScience's intended future architecture is:

```text
                    JunScience Core
                          │
                  Harness Abstraction
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
   DeepSeek Harness   Pi Harness    Codex Harness
```

The goal is NOT to merge three repositories into one giant codebase.

JunScience should own:

```text
Scientific orchestration
Scientific tools
Scientific skills
Evidence
Provenance
Artifacts
Research memory
Projects
Research jobs
Safety
```

Harnesses may provide:

```text
Agent loop
Model interaction
Tool execution semantics
Streaming
Sessions
Events
Coding capabilities
Terminal capabilities
Runtime infrastructure
```

Determine whether the current architecture already provides a clean boundary for this.

---

# 20. DEEPSEEK / PI / CODEX COMPARATIVE STUDY

Do not implement anything yet.

Inspect the current upstream architecture of:

```text
DeepSeek Harness
Pi
Codex
```

Determine:

### DeepSeek Harness

What is reusable for:

* plugin architecture
* runtime
* events
* tools
* sessions
* sandbox
* CLI

### Pi

What is reusable for:

* model abstraction
* agent core
* event model
* tool execution
* extensibility
* streaming
* runtime composition

### Codex

What is reusable for:

* Agent runtime
* app-server concepts
* typed events
* request/response protocol
* session handling
* streaming
* coding/terminal execution
* client/runtime separation

Do NOT blindly copy any implementation.

Produce an architecture comparison.

---

# 21. MULTI-HARNESS DESIGN QUESTION

Answer this question:

> What is the smallest stable interface JunScience should require from a Harness?

Propose an interface conceptually similar to:

```text
Harness
├── createSession()
├── run()
├── send()
├── cancel()
├── subscribe()
├── executeTool()
├── getState()
└── dispose()
```

But do not assume this exact API is correct.

Derive the interface from the actual upstream architectures.

Identify:

```text
JunScience-owned responsibility
vs
Harness-owned responsibility
```

---

# 22. CURRENT ARCHITECTURE MAP

Produce the ACTUAL architecture.

Use:

```text
Frontend
   ↓
API
   ↓
Agent Runtime
   ↓
Harness
   ↓
Model API
   ↓
Agent Loop
   ↓
Tools
   ↓
Scientific Services
   ↓
Compute/Sandbox
   ↓
Artifacts
   ↓
Evidence/Provenance
```

For every layer mark:

```text
REAL
PARTIAL
MOCK
MISSING
```

---

# 23. TEST REALITY AUDIT

Inspect ALL major tests.

Classify every important test as:

```text
UNIT TEST
MOCK TEST
FIXTURE TEST
INTEGRATION TEST
REAL API TEST
REAL COMPUTE TEST
END-TO-END TEST
```

Pay special attention to any test claiming:

```text
100% success
autonomous research
scientific discovery
literature search
Python analysis
citations
```

Determine whether:

```text
LLM call occurred
network request occurred
Python process occurred
scientific computation occurred
real data was retrieved
```

If a test completes suspiciously quickly, investigate why.

Do not use duration alone as proof of mocking, but investigate unusually deterministic or instantaneous tests carefully.

---

# 24. FRONTEND ↔ AGENT REALITY

Inspect whether the completed frontend is connected to the actual Agent runtime.

Determine:

* Is Agent streaming real?
* Are tool events real?
* Are artifacts real?
* Are citations real?
* Is cancellation real?
* Are errors real?
* Is CLI connected to the same Agent core?
* Does Desktop use the same runtime?
* Does headless execution use the same runtime?

The intended principle is:

```text
Desktop
CLI
Headless
   ↓
Same JunScience Agent Core
```

---

# 25. IMPORTANT: DO NOT PENALIZE USER-CONFIGURED MODEL ARCHITECTURE

The audit MUST NOT recommend building:

```text
OpenAI integration
Anthropic integration
DeepSeek integration
Gemini integration
```

merely because other Agent products have them.

Instead evaluate whether JunScience has a strong:

```text
user-configured model/API layer
```

with:

```text
API Base URL
API Key
Model
Protocol
Streaming
Tool Calling
Configuration
Security
```

This is the intended product direction.

---

# 26. IDENTIFY FAKE COMPLETENESS

Look specifically for:

```text
hard-coded scientific values
hard-coded citations
fake tool outputs
predefined Agent responses
fake progress indicators
fake execution logs
fixture-only autonomous research
mock database responses
static generated figures
hard-coded research plans
deterministic "Agent" workflows
```

Search source code for suspicious patterns such as:

```text
mock
fixture
fake
demo
sample
placeholder
TODO
hardcoded
static
example
testData
fakeResult
```

Do not automatically classify every occurrence as fake.

Trace how the data flows.

---

# 27. FINAL AUDIT TABLE

Produce:

| Area | Status | Real / Mock | Evidence | Severity | Problem | Recommendation |
| ---- | ------ | ----------- | -------- | -------- | ------- | -------------- |

Include at minimum:

```text
Frontend
Agent Runtime
LLM Configuration
LLM Invocation
Agent Loop
Harness
DeepSeek Harness
Pi readiness
Codex readiness
Scientific Tools
Literature
Scientific Databases
Python
Sandbox
Skills
OpenScience
Specialist Agents
Memory
Projects
Jobs
Artifacts
Citations
Evidence
Provenance
Security
Testing
CLI
Desktop
```

---

# 28. FINAL ANSWER — REQUIRED SECTIONS

Your final audit response MUST contain:

## A. What is genuinely implemented

Only include things verified from source code.

## B. What is partially implemented

Explain exactly what is missing.

## C. What is mocked / simulated

List every important mock or fixture.

## D. What is documentation-only

Identify claims that are not backed by implementation.

## E. Critical bugs

List bugs that prevent real scientific use.

## F. Scientific reliability risks

List risks such as:

* hallucinated evidence
* invalid citations
* unverified data
* non-reproducible computation
* fake tool execution
* missing provenance
* incorrect statistical workflows

## G. Security risks

Prioritize CRITICAL/HIGH risks.

## H. Architecture problems

Especially:

* coupling
* duplicated runtimes
* harness boundaries
* tool architecture
* skill architecture
* model configuration
* event architecture
* state management

## I. Multi-harness assessment

Explain how ready JunScience currently is for:

```text
DeepSeek Harness
Pi
Codex Harness
```

## J. Top 10 next tasks

Rank the next ten engineering tasks by:

```text
Impact
Difficulty
Dependency
Priority
```

---

# 29. NEXT-PHASE RECOMMENDATION

Do NOT implement the next phase.

Instead, finish with a proposed architecture for:

```text
JunScience v1.0
```

The target should conceptually contain:

```text
JunScience UI
      ↓
JunScience API
      ↓
Research Job System
      ↓
Scientific Agent Core
      ↓
Harness Abstraction
      ├── DeepSeek Harness
      ├── Pi
      └── Codex Harness
      ↓
User-configured Model/API
      ↓
Scientific Tools
      ↓
Scientific Skills
      ↓
Scientific Compute
      ↓
Evidence + Provenance
      ↓
Artifacts + Research Memory
```

Do not assume this architecture is already correct.

Use the audit findings to refine it.

---

# 30. ABSOLUTE RULES

During this audit:

```text
DO NOT modify source code.

DO NOT install new packages.

DO NOT refactor.

DO NOT implement features.

DO NOT rewrite tests.

DO NOT create mock implementations.

DO NOT claim something is real without source-level evidence.

DO NOT trust walkthrough.md as proof.

DO NOT trust passing tests as proof of real external execution.

DO NOT assume cloned repositories are integrated.

DO NOT assume a skill is usable merely because SKILL.md exists.

DO NOT assume an Agent is autonomous merely because it has an Agent class.

DO NOT recommend vendor-specific model integrations unless technically required.

DO NOT replace the user-configured API strategy with a provider marketplace architecture.
```

The only deliverable of this task is:

> **A brutally honest engineering and scientific-agent reality audit of the current JunScience repository.**

````

---
