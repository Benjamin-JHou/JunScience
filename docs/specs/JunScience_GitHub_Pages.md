# JunScience GitHub Pages — Landing Page Specification

## 0. Task

Build the official **JunScience GitHub Pages landing page** for:

`https://github.com/Benjamin-JHou/JunScience`

This is **not** a generic AI SaaS marketing page.

The desired result is a serious, documentation-first **AI4S / scientific framework homepage**, inspired by the information architecture and clean presentation of the OmicVerse documentation homepage:

`https://omicverse.github.io/omicverse-pages/index.html`

Do not copy OmicVerse branding, source code, text, or assets. Adapt its **framework/documentation portal structure** to JunScience.

Use the supplied visual reference image as the primary visual direction:

`a_full_page_website_screenshot_landing_page_mock.png`

---

## 1. Product Positioning

JunScience is:

> **JunScience — AI for Scientific Discovery**

The current repository describes JunScience as an evidence-traceable scientific/biomedical research Agent, with emphasis on molecular biology, clinical evidence, medical multimodal research, scientific tools, reproducibility, and agent orchestration.

The current README describes capabilities including:

- evidence-first validation
- DeepSeek Harness sub-agent tree
- explicit planning and task tracking
- clinical data privacy gate
- multimodal text/image reasoning
- dynamic autonomous ReAct research loop
- OS-level sandboxing
- critique and citation verification
- bidirectional MCP interoperability

Represent only capabilities that are actually supported by the current repository. Do not invent features, benchmarks, statistics, papers, integrations, or usage numbers.

---

# 2. Design Direction

The default visual style should be:

- documentation-first
- academic
- scientific
- clean
- bright
- spacious
- technical
- trustworthy
- modern AI4S

Default theme: **Light**.

Use:

- white / near-white background
- light blue-gray borders
- blue primary accent
- cyan secondary accent
- restrained purple scientific accents
- restrained green for verified/success states
- dark navy text

Avoid:

- black futuristic SaaS aesthetic
- excessive neon
- excessive glow
- huge marketing slogans
- crypto/Web3 styling
- generic AI startup visuals
- giant hero with little useful information

The site should feel like:

> **a serious open-source scientific framework that happens to have a powerful AI Agent**

rather than a commercial chatbot landing page.

---

# 3. Information Architecture

Use a documentation-style left sidebar on desktop.

Suggested navigation:

```text
JunScience
AI for Scientific Discovery

Home

Documentation
Installation
Quick Start
User Guide

API Reference
Examples

CLI Agent
Architecture
Agent Skills
Use Cases

Contributing
Changelog

----------------
GitHub
Discord
Paper / Citation

Light / Dark
```

Only link to pages that actually exist. If a page does not exist, either create a sensible page/placeholder or omit the link. Never leave broken navigation.

On mobile, collapse the sidebar into a hamburger menu.

---

# 4. Header

Keep the top header compact.

Right side:

```text
GitHub Star
Get Started
```

Optional search.

The sidebar remains the primary navigation.

---

# 5. Hero

Do NOT make the hero an oversized marketing banner.

Use a documentation-style hero.

### Left

```text
JunScience

AI for Scientific Discovery
```

Description:

```text
An open-source AI agent framework for scientific research.

Explore literature, analyze scientific data, run computational workflows,
and build reproducible research with autonomous agents.
```

Primary:

```text
Quick Start →
```

Secondary:

```text
GitHub Repo
```

### Right

Use the existing JunScience logo / scientific atomic-J visual where possible.

Prefer existing repository assets rather than generating an unrelated new logo.

A subtle scientific composition can include:

- molecular structure
- data panel
- literature panel
- agent activity
- research artifact

Keep it restrained.

---

# 6. Capability Strip

Immediately below the hero, create four compact columns:

### AI-Powered Agents
Specialized agents collaborate on complex research tasks.

### Scientific Tools
Literature, molecular, biological, data-analysis and computational tools.

### Reproducible Research
Evidence, citations, provenance, artifacts and reproducible execution.

### Open Source
Built for researchers and developers.

Use compact scientific icons.

---

# 7. Architecture

Create a major `Architecture` section.

Headline:

```text
Architecture
```

Subheading:

```text
JunScience is built as a modular scientific Agent runtime.
```

Show a clean horizontal architecture diagram:

```text
User Interface
      ↓
JunScience Core
      ↓
Agent Harness
      ↓
Scientific Tools & Skills
      ↓
Results & Artifacts
```

For the future multi-harness direction, show:

```text
DeepSeek Harness
Pi
Codex Harness
```

But **never claim Pi or Codex are integrated if they are not actually integrated in the repository**.

Use status labels such as:

```text
Integrated
Experimental
Planned
```

based on actual repository state.

---

# 8. Architecture Cards

Below the architecture diagram, use three cards.

## Agent Harnesses

Explain the modular harness concept.

Show:

- DeepSeek Harness
- Pi
- Codex Harness

Status must reflect reality.

## Key Capabilities

Use repository-backed capabilities such as:

- literature search
- scientific data retrieval
- molecular / biological analysis
- Python execution
- data analysis
- visualization
- evidence tracking
- citation verification
- critique
- reproducibility
- MCP interoperability

Only include capabilities verified in the repository.

## Use Cases

Prefer scientific examples:

- Literature review
- Drug discovery
- Molecular analysis
- Single-cell / multi-omics
- Clinical evidence research
- Medical multimodal analysis
- Scientific data analysis
- Scientific writing

Do not present a use case as production-ready unless the repository supports it.

---

# 9. Scientific Research Workflow

Create a clean explanatory section:

```text
Ask
  →
Plan
  →
Search
  →
Retrieve Evidence
  →
Analyze
  →
Execute
  →
Critique
  →
Report
```

This is a conceptual scientific workflow, not a corporate business-process flowchart.

Use scientific icons and compact labels.

---

# 10. Evidence / Reproducibility

This should be one of the strongest sections.

Headline:

```text
Evidence-first scientific research
```

Show:

```text
Research Claim
      ↓
Evidence
      ↓
Source / Dataset
      ↓
Tool Execution
      ↓
Code / Parameters
      ↓
Artifact
      ↓
Reproducible Result
```

Where actually implemented, mention concepts such as:

- `EV-xxx` evidence anchors
- `EvidenceVerifier`
- `CritiqueEngine`
- PMID / NCT verification
- provenance

Do not invent additional evidence mechanisms.

---

# 11. Scientific Domains

Create a compact grid:

```text
Molecular Biology
Biomedical Research
Clinical Evidence
Drug Discovery
Computational Biology
Medical Multimodal
Scientific Data Analysis
AI for Science
```

Each card should contain:

- icon
- one-line description
- link only if a real documentation/example page exists

The purpose is to communicate breadth without creating a giant feature catalog.

---

# 12. Scientific Tools & Agent Skills

Section title:

```text
Scientific Tools & Agent Skills
```

Explain:

```text
JunScience combines Agent reasoning with executable scientific tools
and domain-specific skills.
```

Show categories such as:

```text
Literature
Biological Databases
Chemical Databases
Protein / Structure
Python
Data Analysis
Visualization
MCP
Scientific Skills
```

Use exact tool names from the repository where useful.

Do not invent APIs.

---

# 13. Quick Start

Include a compact documentation-style Quick Start.

Example only:

```bash
git clone https://github.com/Benjamin-JHou/JunScience.git
cd JunScience
npm install
npm run dev
```

**Verify the actual installation commands in the repository before displaying them.**

The section should guide:

```text
Install
Configure
Run
Try your first research task
```

Link to actual setup documentation when available.

---

# 14. CLI / Desktop Showcase

Use the actual repository screenshots.

The repository currently contains assets including:

```text
screenshot_desktop_dark.png
screenshot_desktop_light.png
screenshot_cli_green.png
screenshot_cli_blue.png
screenshot_cli_purple.png
screenshot_cli_amber.png
screenshot_gallery.png
screenshot_workspace_dark.png
screenshot_m2_workspace.png
```

Do not recreate these screenshots.

Create a compact section:

```text
One Scientific Agent. Multiple Interfaces.
```

Show:

- Desktop
- CLI
- Workspace

Use a clean gallery or tabs.

Do not turn the page into an image-heavy marketing page.

---

# 15. Open Source Section

Create:

```text
Open Source. Built for Researchers.
```

Suggested copy:

```text
Explore the source, extend the Agent runtime,
add scientific skills, build tools, and contribute new research workflows.
```

Buttons:

```text
GitHub
Documentation
Contributing
```

Use the real repository URL.

---

# 16. Academic Identity / Citation

Because JunScience is a scientific framework, give it an academic identity.

Use:

```text
Cite JunScience
```

If an actual paper/citation exists in the repository, use it.

If not, do not fabricate a citation.

A legitimate placeholder can be:

```text
Paper coming soon
```

only if appropriate.

---

# 17. Footer

Documentation-style footer.

### JunScience

```text
AI for Scientific Discovery
Open-source scientific Agent framework
```

### Resources

```text
Documentation
Quick Start
Examples
API Reference
Architecture
```

### Community

```text
GitHub
Issues
Discussions
Contributing
```

### Project

```text
License
Changelog
Third-party notices
```

Bottom:

```text
© JunScience
Open source under MIT License
```

Verify the actual license.

---

# 18. Theme

Implement:

```text
Light
Dark
```

Default:

```text
Light
```

Dark mode should inherit the existing JunScience desktop dark visual language:

- deep navy / black
- blue / cyan scientific accents
- restrained purple
- strong contrast

Do not create an unrelated dark theme.

Persist the preference and respect system preference when no preference is saved.

---

# 19. Responsive Design

Support:

```text
1440px
1280px
1024px
768px
390px
```

Desktop:

```text
sidebar + content
```

Mobile:

```text
collapsed sidebar
single-column content
stacked cards
vertical architecture
```

Do not merely scale down the desktop layout.

---

# 20. Accessibility

Implement:

- semantic HTML
- keyboard navigation
- visible focus states
- sufficient contrast
- alt text
- reduced-motion support
- accessible buttons
- accessible navigation

---

# 21. Technical Requirements

First inspect the existing project.

Determine whether the GitHub Pages site is:

- static HTML
- Vite
- React
- another framework

Prefer extending the existing architecture.

If the repository already contains:

```text
index.html
src/
public/
vite.config.ts
tailwind.config.js
```

do not replace the stack unnecessarily.

Avoid large dependency additions unless justified.

---

# 22. GitHub Pages

Verify:

- build command
- output directory
- base path
- static assets
- routing
- image paths
- favicon
- GitHub Actions deployment
- refresh behavior
- relative URLs

The page must work at the actual GitHub Pages URL.

Do not assume root-domain hosting.

---

# 23. SEO / Metadata

Add:

```text
<title>
<meta description>
Open Graph title
Open Graph description
Open Graph image
favicon
theme-color
```

Suggested title:

```text
JunScience — AI for Scientific Discovery
```

Suggested description:

```text
An open-source AI agent framework for scientific research, evidence-driven analysis, computational workflows, and reproducible discovery.
```

Do not make unsupported claims.

---

# 24. Visual Rules

### Sidebar

- narrow
- light
- fixed/sticky on desktop
- clear active state

### Main content

- max-width approximately 1180–1280px
- generous whitespace
- readable typography
- strong section hierarchy

### Cards

- subtle border
- very light shadow
- moderate radius
- restrained use of glassmorphism

### Typography

Prefer:

```text
Inter
system-ui
-apple-system
BlinkMacSystemFont
Segoe UI
```

### Accent palette

Primary:

```text
#2563EB
```

Secondary:

```text
#06B6D4
#7C3AED
#10B981
#F59E0B
```

Do not use every accent at maximum saturation.

---

# 25. What NOT to Do

Do NOT create:

- generic AI startup landing page
- giant neon hero
- dark-only page
- pricing table
- fake testimonials
- fake user counts
- fake GitHub stars
- fake benchmark scores
- fake scientific results
- fake paper citations
- fake integration badges
- fake “100+ tools” unless verified
- fake “autonomous discovery” claims
- stock laboratory photography
- excessive animations

The site should communicate:

> **open-source scientific infrastructure**

rather than:

> **commercial AI product**

---

# 26. Content Accuracy Rule

Before writing content, inspect:

- `README.md`
- `Agent.md`
- `Frontend_UI.md`
- source code
- `docs/`
- existing screenshots
- package metadata
- license
- GitHub repository structure

Use repository reality as the source of truth.

If a feature is:

```text
implemented → Available
partially implemented → Experimental
planned → Planned
```

Never present planned functionality as shipped.

---

# 27. OmicVerse Reference Principle

The OmicVerse homepage demonstrates a useful framework/documentation structure:

```text
Project identity
↓
Installation
↓
Tutorials
↓
API Reference
↓
Domain-specific research workflows
↓
AI / Agent interface
↓
Community / GitHub
```

JunScience should adapt that principle:

```text
Project identity
↓
Quick Start
↓
Core Concepts
↓
Scientific Agent
↓
Architecture
↓
Tools & Skills
↓
Research Workflows
↓
CLI / Desktop
↓
API / Developer Docs
↓
Community
```

The objective is for GitHub Pages to feel like a **scientific framework portal**, not a promotional microsite.

---

# 28. Acceptance Criteria

## Visual

- [ ] Light documentation-first design
- [ ] Matches the supplied visual reference direction
- [ ] JunScience branding is consistent
- [ ] Sidebar feels like a scientific documentation site
- [ ] Hero is restrained and technical
- [ ] Architecture is visually clear
- [ ] Scientific capabilities are easy to scan
- [ ] Existing screenshots are used effectively
- [ ] Dark mode is coherent

## Content

- [ ] No fabricated features
- [ ] No fabricated citations
- [ ] No fabricated benchmarks
- [ ] No fabricated GitHub statistics
- [ ] Planned features clearly labeled
- [ ] Current repository capabilities accurately represented

## Technical

- [ ] Existing architecture preserved where practical
- [ ] Production build succeeds
- [ ] GitHub Pages build succeeds
- [ ] Assets resolve correctly
- [ ] Mobile layout works
- [ ] Theme switching works
- [ ] Navigation works
- [ ] No console errors
- [ ] No broken links
- [ ] No missing images

## Quality

- [ ] Looks like a serious scientific open-source project
- [ ] Does not look like generic AI SaaS
- [ ] Does not overuse gradients/glows
- [ ] Information density resembles a high-quality scientific framework homepage
- [ ] User immediately understands what JunScience is
- [ ] User can immediately find how to start
- [ ] User can immediately understand the architecture and scientific scope

---

# 29. Final Implementation Procedure

Before coding:

1. Inspect the repository.
2. Inspect the existing frontend.
3. Inspect the current README and docs.
4. Inspect existing screenshots/assets.
5. Study the supplied visual reference.
6. Study the information architecture of the OmicVerse homepage.
7. Plan the page structure.
8. Implement the page.
9. Run the production build.
10. Verify GitHub Pages compatibility.
11. Test desktop and mobile.
12. Fix broken links/assets.
13. Only then report completion.

Do not modify unrelated Agent/runtime/scientific code.

This task is specifically for the **GitHub Pages showcase/documentation homepage**.
