# Frontend_UI.md — JunScience Frontend Shell (FINAL SPEC)

> **This file is the authoritative specification for Milestone 1 of JunScience.**
>
> The goal is to rebuild the existing JunScience frontend shell into a polished, production-quality AI4S application.
>
> **The attached JunScience reference image is a visual source of truth.**
>
> Do not treat this document as a loose list of suggestions. Where this document says MUST / DO NOT, follow it literally.
>
> The frontend must be completed **before** connecting the real scientific Agent runtime described in `Agent.md`.

---

# 0. Codex Mission

You are rebuilding the **frontend shell of JunScience**, not building a generic SaaS dashboard and not building a simple chatbot.

The product should feel like:

> **Codex / Claude Code × scientific computing workstation × AI research environment**

The central idea is:

```text
Scientist
    ↓
JunScience
    ↓
AI Research Agent
    ↓
Scientific tools / code / literature / data / experiments
```

The UI is the **operating environment around the Agent**.

The Agent is the center of gravity.

---

# 1. CRITICAL: USE THE PROVIDED REFERENCE IMAGE AS VISUAL TRUTH

The user has already provided a reference image containing:

1. Desktop UI — Theme 1: dark futuristic science
2. Desktop UI — Theme 2: light minimalist science
3. CLI — Green
4. CLI — Blue
5. CLI — Purple
6. CLI — Amber

**You must inspect the provided reference image before implementation.**

The image is NOT merely inspiration.

It establishes:

- visual hierarchy
- approximate proportions
- panel arrangement
- density
- logo placement
- typography scale
- card treatment
- border treatment
- color direction
- CLI appearance
- overall JunScience identity

However:

> **Do not literally paste the screenshot into the application. Recreate the UI as real editable frontend components.**

Do not use the screenshot as a full-page background.

Do not crop the screenshot into pieces and call that a UI.

Everything must be implemented as real HTML/CSS/React/etc. components.

---

# 2. FIRST ACTION BEFORE CODING

Before changing code:

```bash
pwd
find . -maxdepth 3 -type f | sort | head -400
```

Then inspect the existing frontend architecture.

Identify:

- framework
- entry point
- routing
- styling system
- component system
- package manager
- existing assets
- existing logo
- existing theme implementation
- existing desktop UI
- existing CLI implementation
- existing mock data

Do NOT delete the existing project blindly.

Reuse good infrastructure.

Replace poor UI implementation where necessary.

---

# 3. FRONTEND SCOPE

This milestone covers the complete **frontend shell**.

Build:

```text
Desktop
├── Dark Theme
├── Light Theme
├── App Shell
├── Sidebar
├── Top Bar
├── Home
├── Agent Input
├── Quick Actions
├── Tools Panel
├── Recent Projects
├── Research Statistics
├── Context Panel
├── Chat / Agent Workspace
├── Tool Execution States
├── Artifact States
├── Command Palette
├── Settings / Theme switching
└── responsive desktop behavior

CLI
├── Green
├── Blue
├── Purple
└── Amber
```

The backend Agent does NOT need to be implemented in this milestone.

Use realistic mock events/data and a clean interface boundary for the future Agent backend.

---

# 4. BRAND

## Product

**JunScience**

## Primary positioning

**AI for Scientific Discovery**

## Main application positioning

**Your AI Research Partner**

The UI should communicate:

- scientific intelligence
- advanced computation
- research
- precision
- trustworthy technology
- AI
- molecular / biological science
- developer-grade tooling

Avoid:

- generic AI startup landing page
- generic SaaS dashboard
- generic medical dashboard
- cartoon science
- excessive neon cyberpunk
- excessive glassmorphism

---

# 5. LOGO

The provided JunScience logo is the canonical logo.

It contains:

- scientific orbital / molecular structure
- central `J`
- blue / cyan / violet energy
- dark scientific identity

Use the existing supplied logo asset if present.

Do NOT redesign the logo.

Do NOT replace it with a generic atom icon.

Do NOT generate a different logo.

The logo must appear in:

- desktop sidebar
- CLI header
- application icon / favicon where supported
- empty states where appropriate

---

# 6. DESKTOP THEMES

There are exactly **two desktop themes**.

## Desktop Theme 1 — Dark Futuristic Science

This is the primary/default theme.

Visual language:

```text
near-black
deep navy
cool blue
cyan
electric blue
subtle violet
```

Characteristics:

- dark background
- high contrast
- thin borders
- subtle blue/cyan glow
- restrained scientific visual elements
- premium developer-tool feeling
- sophisticated
- calm
- dense but not cramped

The dark theme should feel like a:

> **high-end scientific computing workstation**

It must NOT feel like a gaming UI.

---

## Desktop Theme 2 — Light Scientific

Visual language:

```text
white
off-white
cool gray
very pale blue
cyan
blue
```

Characteristics:

- bright
- clean
- academic
- precise
- minimal
- subtle blue scientific accents
- very light borders
- very restrained shadows

The light theme must be the **same application**, not another design.

Dark and Light MUST preserve:

- identical layout
- identical navigation
- identical information architecture
- identical component hierarchy
- identical spacing system
- identical interaction model

Only design tokens change.

---

# 7. DESKTOP APP SHELL

Desktop layout MUST use this hierarchy:

```text
┌─────────────────────────────────────────────────────────────┐
│                       TOP BAR                               │
├───────────────┬──────────────────────────────┬──────────────┤
│               │                              │              │
│   SIDEBAR     │       MAIN WORKSPACE         │ CONTEXT      │
│               │                              │ PANEL        │
│               │                              │              │
│               │                              │              │
│               │                              │              │
│               │                              │              │
├───────────────┴──────────────────────────────┴──────────────┤
│              Agent / command / status area                  │
└─────────────────────────────────────────────────────────────┘
```

Do not turn the application into a full-width dashboard grid.

The main workspace must remain visually dominant.

---

# 8. DESKTOP PROPORTIONS

Use the reference image as the visual target.

Start with:

```text
Sidebar:       ~230–250px
Context panel: ~250–300px
Main area:     remaining width
Top bar:       ~44–52px
```

These values may adapt slightly for different desktop widths, but:

> **Do not allow the sidebar or context panel to become visually dominant.**

The main Agent workspace must occupy the majority of the screen.

At 1440px width, the layout must still feel comfortable.

At 1920px width, do not stretch the central content excessively.

Use a sensible maximum content width inside the main workspace.

---

# 9. TOP BAR

The top bar should be compact.

Include:

- global search
- notification/status affordances
- settings
- current project/session context when appropriate

Search should visually resemble a developer-tool search field rather than a website search bar.

Placeholder:

```text
Search anything...
```

Keyboard shortcut:

```text
⌘K / Ctrl+K
```

---

# 10. LEFT SIDEBAR

The sidebar is persistent.

Top:

```text
[JunScience logo] JunScience
```

Then a prominent:

```text
+ New Chat
```

Navigation:

```text
Home
Literature
Data Analysis
Experiment Design
Code Assistant
Molecule Explorer
Notebook
Knowledge Base
My Projects
```

Bottom area:

```text
User
Plan / status
Settings
```

The sidebar must support:

- expanded state
- collapsed state
- active state
- hover state
- keyboard navigation

Do NOT make the sidebar look like a traditional enterprise navigation tree.

Use:

- small icons
- concise labels
- restrained active background
- thin borders
- subtle hover feedback

---

# 11. HOME SCREEN — MOST IMPORTANT DESKTOP SCREEN

The Home screen is the primary visual target.

It must resemble the provided reference image in composition.

Central hierarchy:

```text
JunScience

Your AI Research Partner

Ask anything about science. Discover, analyze, and innovate.

[ Ask a question or describe your research...              → ]
```

The Agent input is the most important interactive element on the Home page.

Do NOT replace it with a generic chat composer.

Do NOT make the hero into a marketing landing page.

---

# 12. HOME HERO

Recommended visual composition:

```text
                JunScience
        Your AI Research Partner

 Ask anything about science. Discover, analyze, and innovate.

 ┌──────────────────────────────────────────────────────┐
 │ Ask a question or describe your research...       → │
 └──────────────────────────────────────────────────────┘
```

On the right side of the hero, use a **subtle scientific visual** inspired by the reference:

- atom/orbital
- molecular network
- DNA
- scientific graph
- molecular geometry

For dark mode:

- cyan
- blue
- subtle violet

For light mode:

- pale blue
- cyan
- very light scientific line art

The visual must remain subordinate to the Agent input.

Do not use a giant illustration.

Do not use a cartoon.

Do not create excessive animation.

---

# 13. AGENT INPUT

The Agent input must feel premium.

It should support:

- multiline input
- submit
- Enter to send
- Shift+Enter for newline
- attachment affordance
- optional model/agent selector
- loading state
- disabled state
- cancel state

Placeholder:

```text
Ask a question or describe your research...
```

The submit button should be a compact circular/square action button.

Do not use an oversized "Send" button.

---

# 14. QUICK ACTIONS

Directly below the Agent input:

```text
Literature Review
Data Analysis
Experiment Design
Code Assistant
More
```

These MUST be compact pills/buttons.

They are shortcuts, not dashboard cards.

Do NOT make five giant feature cards.

---

# 15. RIGHT CONTEXT PANEL

The reference image uses a right-side contextual panel.

Implement it as a lightweight contextual panel.

Primary section:

```text
Tools
```

Tools:

```text
Literature Search
Data Analysis
Experiment Design
Code Assistant
Molecule Explorer
```

Each item should contain:

- icon
- name
- one-line description

Example:

```text
Literature Search
Search and summarize scientific papers
```

Second section:

```text
Tips
```

Examples:

```text
Explain this paper
Analyze this data
Design an experiment
Write analysis code
```

The panel must feel like **Agent context**, not an admin dashboard.

It must be collapsible.

---

# 16. RECENT PROJECTS

Home includes:

```text
Recent Projects                         View All
```

Use compact project cards.

Example:

```text
Autoimmune Target Discovery
Today

Molecular Docking Analysis
Yesterday

Single-cell RNA-seq Analysis
2 days ago

Protein Structure Prediction
3 days ago
```

Cards should be:

- compact
- low visual weight
- easy to scan
- clickable

Do NOT turn the home page into a giant statistics dashboard.

---

# 17. RESEARCH STATISTICS

A small secondary statistics row is allowed.

Use:

```text
Projects
12

Analyses
48

Papers Read
256

Hours Saved
120+
```

These are supporting metrics.

They MUST NOT compete visually with the Agent.

---

# 18. CHAT / AGENT WORKSPACE

When the user submits a request, transition from Home into a dedicated Agent workspace.

The workspace should feel closer to:

```text
Codex
Claude Code
developer IDE
scientific notebook
```

than a consumer chatbot.

Recommended layout:

```text
┌──────────────┬───────────────────────────────┬─────────────┐
│ Sidebar      │ Agent conversation            │ Context     │
│              │                               │             │
│              │ User request                  │ Sources     │
│              │                               │ Tools       │
│              │ Agent response                │ Artifacts   │
│              │                               │             │
│              │ Tool execution                │             │
│              │                               │             │
│              │ Agent response                │             │
│              │                               │             │
│              │ [composer]                    │             │
└──────────────┴───────────────────────────────┴─────────────┘
```

---

# 19. AGENT MESSAGE DESIGN

Do not render every message as a giant rounded bubble.

The Agent should look like a research workspace.

Support:

- Markdown
- headings
- lists
- tables
- citations
- inline code
- code blocks
- scientific equations where appropriate
- images / plots
- artifact previews
- tool execution cards

User messages may be visually differentiated, but should remain understated.

Agent messages should prioritize readable content.

---

# 20. TOOL EXECUTION UI

Tool execution is a core JunScience visual pattern.

Example:

```text
◌ Literature Search

Searching scientific literature...
127 papers found
```

or:

```text
✓ Data Analysis

Loading dataset
Running QC
Running statistical analysis

Completed
```

or:

```text
◌ Python

Running analysis.py
```

Tool cards should visually communicate:

```text
queued
running
completed
failed
cancelled
```

Do not use huge animated spinners.

Use subtle status indicators.

---

# 21. AGENT STATES

The frontend must support:

```text
idle
thinking
planning
tool_calling
executing
generating
waiting_for_permission
completed
error
cancelled
```

Example visible states:

```text
Thinking...
Planning research workflow...

Searching 127 papers...

Running Python analysis...

Generating figure...

Synthesizing results...
```

States should be visually distinct but restrained.

---

# 22. SCIENTIFIC ARTIFACTS

Design reusable artifact cards.

Supported conceptual artifact types:

```text
Paper
Citation
Dataset
Table
Figure
Code
Notebook
Molecule
Protein
Experiment
Report
```

Example:

```text
Figure
Differential expression volcano plot

[Preview]

Generated from:
analysis.py

Open
```

Artifacts should be visually stronger than ordinary text but weaker than the main Agent response.

---

# 23. CITATIONS

Citations must have a dedicated visual treatment.

Example:

```text
[1] Smith et al. 2026
Nature Methods
DOI ...
```

Support:

- citation hover
- source preview
- external source link
- source metadata

Do not fake citations.

For frontend mock data, clearly use realistic but fictional demo records where necessary.

---

# 24. CODE BLOCKS

Code should look like a professional developer environment.

Use:

- monospace font
- syntax highlighting
- line numbers where appropriate
- copy button
- language label
- optional run/open actions

Avoid overly rounded code containers.

---

# 25. COMMAND PALETTE

Implement:

```text
⌘K / Ctrl+K
```

Commands:

```text
New Chat
Search Literature
Open Project
Run Analysis
Open Notebook
Open Molecule Explorer
Open Knowledge Base
Switch Theme
Settings
```

The command palette should feel similar to:

- VS Code
- Linear
- Codex
- modern developer tools

It should be fast and keyboard-first.

---

# 26. DESKTOP DESIGN TOKENS

Create a centralized token system.

Never hard-code theme colors inside individual components.

Required tokens:

```text
background
surface
surface-elevated
surface-hover
border
border-subtle
text-primary
text-secondary
text-muted
accent
accent-hover
accent-soft
success
warning
error
focus
selection
code-background
```

---

# 27. DARK TOKEN DIRECTION

Use approximate ranges, then tune visually against the reference.

Conceptual palette:

```text
Background:
near-black / deep navy

Surface:
dark navy

Elevated:
slightly lighter navy

Border:
low-opacity cool blue

Primary text:
near-white

Secondary text:
cool gray

Accent:
cyan / electric blue

Secondary accent:
subtle violet

Success:
scientific green

Warning:
amber

Error:
red
```

Avoid extremely saturated neon everywhere.

Accent color should be used strategically.

---

# 28. LIGHT TOKEN DIRECTION

Conceptual palette:

```text
Background:
white / off-white

Surface:
white

Elevated:
very pale cool gray

Border:
light blue-gray

Primary text:
near-black navy

Secondary text:
cool gray

Accent:
blue / cyan

Secondary accent:
very pale blue

Success:
green

Warning:
amber

Error:
red
```

The light theme must have sufficient contrast.

Do not make text pale gray on white.

---

# 29. BORDER / RADIUS / SHADOW RULES

Use a restrained professional system.

Preferred:

```text
small radius
medium radius
thin borders
very subtle shadows
```

Avoid:

```text
huge pill-shaped cards
huge rounded rectangles
heavy drop shadows
glassmorphism everywhere
```

Not every component needs a visible border.

---

# 30. TYPOGRAPHY

Desktop:

Prefer a modern system / professional sans-serif font.

Suggested priority:

```text
Inter
SF Pro / system-ui
Geist
```

Do not introduce unnecessary font downloads if the project already has an appropriate font.

CLI / code:

Use a professional monospace font.

Suggested:

```text
JetBrains Mono
SF Mono
IBM Plex Mono
ui-monospace
```

Typography hierarchy:

```text
Hero
Page title
Section title
Body
Secondary
Metadata
Code
```

Do not overuse bold text.

---

# 31. ICONS

Use one coherent icon family.

Preferred:

```text
Lucide
```

or the icon system already used by the project.

Do not mix unrelated icon styles.

Icons should be:

- small
- crisp
- consistent
- secondary to text

Do not use emoji as UI icons.

---

# 32. SCIENTIFIC VISUAL LANGUAGE

Use scientific visuals sparingly.

Acceptable:

- molecular networks
- DNA line art
- atom/orbital patterns
- protein silhouettes
- graph networks
- subtle particles
- scientific geometry

Rules:

```text
scientific
not decorative
subtle
not noisy
```

Do not make the application look like a science-fiction movie.

---

# 33. ANIMATION

Animation must be restrained.

Use animation only for:

- streaming
- tool progress
- state transitions
- sidebar collapse
- panel transitions
- command palette
- loading

Avoid:

- constant floating particles
- excessive glow
- large entrance animations
- marketing-style animations

The application should feel fast.

---

# 34. CLI — IMPORTANT

The CLI is NOT a desktop UI rendered inside a fake terminal window.

It must feel like an actual terminal Agent.

Reference feeling:

```text
Codex
Claude Code
modern AI coding agents
professional scientific terminal
```

CLI uses exactly four themes:

```text
1. Green
2. Blue
3. Purple
4. Amber
```

The layout and behavior are identical across all four themes.

Only tokens change.

---

# 35. CLI STRUCTURE

Conceptual:

```text
JunScience Agent
AI Research Assistant
Type 'help' for available commands

junscience>

[Quick Actions]

[Recent Research]

junscience>
```

When running a task:

```text
junscience> Analyze the differential expression dataset

◌ Data Analysis
  Loading dataset...

◌ Quality Control
  Running QC...

◌ Statistics
  Running differential analysis...

✓ Result
  1,247 significant genes identified

junscience>
```

The output must feel native to a terminal.

---

# 36. CLI GREEN

Theme:

```text
black
dark green
bright terminal green
```

Feeling:

> classic scientific computing / Matrix-inspired terminal

Use green for:

- prompt
- borders
- active state
- cursor
- status
- headings

Do not make the entire screen bright green.

---

# 37. CLI BLUE

Theme:

```text
black
deep blue
cyan
electric blue
```

Feeling:

> modern developer terminal

Use blue/cyan accents.

---

# 38. CLI PURPLE

Theme:

```text
black
deep violet
purple
magenta
```

Feeling:

> futuristic AI terminal

Keep it professional.

Do not make it neon-gaming style.

---

# 39. CLI AMBER

Theme:

```text
black
dark brown / near-black
amber
orange
```

Feeling:

> retro scientific computing / classic terminal

Use amber as the primary accent.

---

# 40. CLI COLOR TOKENS

Create shared CLI tokens:

```text
terminal-background
terminal-surface
terminal-border
terminal-text
terminal-muted
terminal-accent
terminal-accent-bright
terminal-success
terminal-warning
terminal-error
terminal-cursor
```

Each theme changes only these values.

Do NOT duplicate four separate CLI component trees.

---

# 41. CLI FUNCTIONAL STATES

CLI must visually support:

```text
idle
thinking
tool-running
streaming
success
error
permission-request
```

Examples:

```text
◌ Searching PubMed...
✓ Retrieved 82 papers
✗ API request failed
? Permission required to execute...
```

Use symbols / typography / color sparingly.

---

# 42. CLI RECENT TASKS

Show compact recent research tasks.

Example:

```text
Recent:
• Autoimmune Target Discovery       [Today]
• Molecular Docking Analysis        [Yesterday]
• Single-cell RNA-seq Analysis      [2 days ago]
• Protein Structure Prediction      [3 days ago]
```

No large cards.

---

# 43. RESPONSIVE BEHAVIOR

Primary targets:

```text
1440 × 900
1920 × 1080
MacBook desktop/laptop
```

At smaller desktop widths:

- sidebar can collapse
- context panel can collapse
- main workspace remains usable

Do NOT optimize primarily for mobile.

This product is a desktop scientific workstation.

---

# 44. ACCESSIBILITY

Implement:

- keyboard navigation
- visible focus states
- sufficient contrast
- semantic buttons
- semantic navigation
- tooltips for icon-only actions
- reduced-motion support

Keyboard must be first-class.

---

# 45. KEYBOARD SHORTCUTS

At minimum:

```text
⌘K / Ctrl+K       Command Palette
⌘N / Ctrl+N       New Chat
Enter             Submit
Shift+Enter       New line
Esc               Close modal/palette
```

Additional shortcuts may be added where natural.

---

# 46. MOCK DATA

Use realistic scientific mock data.

Good examples:

```text
Autoimmune Target Discovery
Molecular Docking Analysis
Single-cell RNA-seq Analysis
Protein Structure Prediction
```

Use realistic:

- paper titles
- genes
- proteins
- molecules
- datasets
- analysis outputs
- plots
- citations
- tool logs

Do NOT use:

```text
Lorem ipsum
Test Project 1
Foo
Bar
Hello World
```

The frontend should already look like a real scientific product.

---

# 47. ARCHITECTURE

Frontend must be componentized.

At minimum create reusable components for:

```text
AppShell
Sidebar
TopBar
GlobalSearch
AgentInput
QuickActions
AgentWorkspace
AgentMessage
ToolCard
ToolStatus
ArtifactCard
Citation
ProjectCard
StatsCard
ContextPanel
CommandPalette
CodeBlock
Terminal
ThemeSwitcher
Modal
Dropdown
Tabs
Toast
EmptyState
LoadingState
```

Avoid page-specific duplicated implementations.

---

# 48. FRONTEND STATE MODEL

The UI should consume a future structured Agent event model.

Design around events conceptually like:

```text
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
task.cancelled
```

Do NOT tightly couple UI components to hard-coded mock strings.

Create adapters / typed models so mock data can later be replaced by the real Agent runtime.

---

# 49. FUTURE BACKEND CONTRACT

The frontend should eventually connect to the Agent runtime from `Agent.md`.

Do not implement a second Agent architecture inside the frontend.

Frontend responsibilities:

```text
render
interact
stream
display
navigate
manage local UI state
```

Backend responsibilities:

```text
reason
plan
execute tools
execute skills
manage sessions
manage jobs
manage scientific workflows
```

---

# 50. ROUTING / INFORMATION ARCHITECTURE

The main navigation should support:

```text
Home
Literature
Data Analysis
Experiment Design
Code Assistant
Molecule Explorer
Notebook
Knowledge Base
My Projects
```

Initially these pages may use high-quality functional placeholders where backend capabilities are not yet implemented.

Do not create empty white screens.

Each should communicate what the future capability does.

---

# 51. SETTINGS

Provide a settings surface with at least:

```text
Appearance
Desktop Theme:
  Dark
  Light

CLI Theme:
  Green
  Blue
  Purple
  Amber
```

Theme preferences should persist.

Use the token system.

---

# 52. DO NOT DO THESE THINGS

These are explicit prohibitions.

### DO NOT

- make a generic SaaS dashboard
- make a generic ChatGPT clone
- paste the screenshot into the page
- use screenshot crops as UI
- use giant feature cards
- use excessive rounded cards
- use excessive gradients
- use excessive glassmorphism
- use excessive neon glow
- use giant decorative scientific illustrations
- use cartoon science
- use emoji as UI icons
- create four duplicated CLI implementations
- hard-code theme colors inside every component
- hard-code mock data into many components
- tightly couple UI to mock Agent logic
- redesign the supplied logo
- destroy the existing project without inspection
- introduce unnecessary frontend frameworks
- optimize mobile at the expense of desktop
- stop at a wireframe
- declare completion without visually checking all themes

---

# 53. IMPORTANT CORRECTION TO THE PREVIOUS FRONTEND IMPLEMENTATION

If the existing implementation does not visually match the supplied reference closely enough:

> **Rebuild the affected components instead of merely tweaking a few colors.**

Do not assume the current layout is correct.

Specifically inspect:

- sidebar width
- central content position
- right panel width
- vertical spacing
- hero scale
- Agent input size
- quick-action density
- project card size
- typography scale
- border opacity
- dark/light contrast
- scientific visual placement
- CLI proportions

The reference image should be used for visual comparison.

---

# 54. VISUAL QA

Before declaring completion, run the application and visually inspect:

## Desktop Dark

```text
1440×900
1920×1080
```

## Desktop Light

```text
1440×900
1920×1080
```

## CLI Green

## CLI Blue

## CLI Purple

## CLI Amber

Verify:

- alignment
- spacing
- hierarchy
- readability
- theme consistency
- no overflow
- no broken icons
- no placeholder UI
- no accidental default browser styles
- no inconsistent border radius
- no inconsistent typography

---

# 55. ACCEPTANCE TEST — HOME

The Home screen should immediately communicate:

```text
This is JunScience.
This is an AI research agent.
I can ask it a scientific question here.
I can launch scientific workflows.
I can access research projects.
```

A user should understand the product within 3 seconds.

---

# 56. ACCEPTANCE TEST — AGENT WORKSPACE

A user should be able to understand:

```text
What I asked
What the Agent is doing
Which tools it is using
What it found
What artifacts it created
What sources it used
```

without reading technical documentation.

---

# 57. ACCEPTANCE TEST — CLI

The CLI must look believable as a real command-line Agent.

It should NOT look like:

```text
a website
a dashboard
a screenshot
a fake terminal card
```

It should look like:

```text
a serious scientific developer tool
```

---

# 58. IMPLEMENTATION ORDER

Follow this exact order.

## Phase 1 — Audit

Inspect:

- existing project
- current frontend
- current assets
- current dependencies
- current implementation

Do not rewrite blindly.

---

## Phase 2 — Design Tokens

Implement:

```text
Desktop Dark
Desktop Light
CLI Green
CLI Blue
CLI Purple
CLI Amber
```

using centralized tokens.

---

## Phase 3 — Desktop Shell

Implement:

```text
AppShell
Sidebar
TopBar
Main Workspace
Context Panel
Theme Switching
```

---

## Phase 4 — Home

Implement:

```text
Hero
Agent Input
Quick Actions
Tools
Recent Projects
Statistics
Scientific visual
```

---

## Phase 5 — Agent Workspace

Implement:

```text
Agent messages
Streaming
Tool cards
Tool status
Artifacts
Citations
Code blocks
Composer
```

using realistic mock data.

---

## Phase 6 — Command Palette / Keyboard

Implement:

```text
⌘K / Ctrl+K
keyboard navigation
theme switching
new chat
```

---

## Phase 7 — CLI

Implement one shared CLI component system with:

```text
Green
Blue
Purple
Amber
```

---

## Phase 8 — Visual QA

Run all six visual variants.

Fix visual problems before adding unnecessary functionality.

---

# 59. DEFINITION OF DONE

This milestone is complete only when:

- [ ] Desktop Dark looks production-quality
- [ ] Desktop Light looks production-quality
- [ ] Dark and Light share the same structure
- [ ] CLI Green works
- [ ] CLI Blue works
- [ ] CLI Purple works
- [ ] CLI Amber works
- [ ] CLI themes share one implementation
- [ ] Logo is correctly used
- [ ] Home screen matches reference composition
- [ ] Agent input is visually dominant
- [ ] Sidebar is compact and professional
- [ ] Context panel is contextual, not dashboard-like
- [ ] Agent workspace exists
- [ ] Tool execution states exist
- [ ] Artifact UI exists
- [ ] Citation UI exists
- [ ] Command palette works
- [ ] keyboard shortcuts work
- [ ] theme persistence works
- [ ] mock data is scientific and realistic
- [ ] frontend is componentized
- [ ] frontend does not contain a second Agent runtime
- [ ] frontend is ready to connect to `Agent.md` runtime
- [ ] no screenshot is used as UI
- [ ] no major visual defect remains

---

# 60. FINAL PRODUCT STANDARD

The final JunScience frontend should feel like:

> **A serious scientist's AI workstation.**

Not:

> another AI chat website.

The visual hierarchy is:

```text
JunScience
     ↓
AI Research Agent
     ↓
Research Question
     ↓
Tools / Knowledge / Code / Data
     ↓
Results
     ↓
Artifacts / Evidence
```

The application should feel:

```text
Premium
Scientific
Technical
Calm
Precise
Intelligent
Futuristic
Professional
```

The design should be distinctive enough that a user can recognize:

> **"This is JunScience."**

---

# 61. FINAL INSTRUCTION TO CODEX

**Do not simply modify the existing frontend until it "looks okay."**

Use the provided reference image + this document as the target.

First inspect the current implementation.

Then identify what is structurally wrong.

Then rebuild the relevant components.

After implementation:

1. run the application
2. inspect every major screen
3. compare visually against the reference
4. fix spacing / sizing / typography / hierarchy
5. test all 6 themes
6. verify keyboard interactions
7. verify theme persistence
8. verify the Agent mock workflow
9. verify no screenshot/cropped image is being used as the UI
10. only then report completion

**Visual quality is a first-class acceptance criterion, not an optional polish step.**
