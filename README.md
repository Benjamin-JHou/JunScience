# JunScience 🧬 🔬

<div align="center">

**Open-Source Evidence-Traceable AI Agent Framework for Scientific & Biomedical Discovery**  
*(Molecular Biology • Clinical Evidence • Medical Multimodal • OS-Level Sandboxing)*

[![Cross-Platform CI](https://github.com/Benjamin-JHou/JunScience/actions/workflows/test.yml/badge.svg)](https://github.com/Benjamin-JHou/JunScience/actions/workflows/test.yml)
[![Desktop Release](https://github.com/Benjamin-JHou/JunScience/actions/workflows/release.yml/badge.svg)](https://github.com/Benjamin-JHou/JunScience/actions/workflows/release.yml)
[![GitHub Pages](https://img.shields.io/badge/Documentation-GitHub_Pages-blue.svg)](https://benjamin-jhou.github.io/JunScience/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-Model_Context_Protocol-green.svg)](https://modelcontextprotocol.io)
[![Platform: macOS | Linux | Windows](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-purple.svg)]()

[English](#english) | [中文说明](#chinese) | [Documentation Portal](https://benjamin-jhou.github.io/JunScience/)

</div>

---

<a name="english"></a>
## 🌐 English Overview

### 📌 Positioning

**JunScience is an open-source, evidence-anchored scientific research agent powered by real empirical data and OS-level sandboxing.**

When provided with a complex research inquiry (e.g., *"Evaluate the allosteric selectivity of TYK2 JH2 pseudokinase vs ATP catalytic domain across JAK family kinases, screen real-world FAERS safety signals, and verify active Phase III clinical trial endpoints"*), JunScience autonomously:
1. Formulates an **explicit 5-stage research plan** and live To-Do checklist.
2. Deploys an isolated **Subagent Hypothesis Tree** to explore competing targets or mechanisms in parallel.
3. Retrieves real-time data across **PubMed, arXiv, bioRxiv, Papers With Code, Hugging Face, UniProtKB, RCSB PDB, ChEMBL, PubChem, ClinicalTrials.gov v2, openFDA, RxNorm, and DailyMed**.
4. Executes Python statistical scripts, radiomics, and clinical NLP within **air-gapped OS kernel sandboxes** (macOS Seatbelt, Linux Bubblewrap, Windows Low-Integrity Tokens).
5. Validates all outputs through the **Pre-Adoption Patch Verification Gate (`EvidenceVerifier`)** (checking $p \in [0, 1]$, $IC_{50} > 0$, CT $HU \in [-1024, 3071]$, and numerical anomalies).
6. Runs a **CritiqueEngine gate** to verify PMIDs, NCT numbers, and sequence lengths.
7. Produces a publication-grade scientific report with tamper-proof **`[Evidence: EV-xxx]`** tags and an immutable **Evidence Traceability Index**.

---

### ✨ Key Architecture & Features

| Architectural Pillar | Technical Implementation |
| :--- | :--- |
| **🔍 Pre-Adoption Patch Verification Gate** | Empirical validation before admission: Python computations, kinetic constants, and radiomics statistics are strictly verified by `EvidenceVerifier` for physical sanity boundaries ($p \in [0,1]$, $IC_{50}>0$, $HU \in [-1024,3071]$) and NaN/ZeroDivision anomalies before assigning `[Evidence: EV-xxx]`. Boundary failures trigger self-correcting feedback loops. |
| **🌲 Subagent Hypothesis Tree** | Concurrent multi-hypothesis exploration: The parent agent dynamically forks isolated subagent branches to evaluate competing targets/mechanisms in parallel, performing cross-branch deduplication and synthesizing a structured **Hypothesis Comparison Matrix**. |
| **📋 Explicit Plan & Stream Orchestration** | Transparent scientific milestones: Formulates an explicit 5-stage research plan at Turn 1, streaming live task milestones (`[✔] Completed` / `[⏳] In Progress` / `[ ] Pending`) and attached `EV-xxx` evidence anchors via EventBus to CLI and Desktop UI. |
| **🛡️ Clinical Data Privacy Gate** | Strict medical ethics: Raw patient EHR texts and DICOM pixel arrays are processed strictly within the local Python sandbox; zero raw patient data is transmitted to external model APIs without explicit user consent. |
| **👁️ Multimodal AI & Radiomics** | Native multimodal block support for OpenAI and Anthropic protocols; executes 3D CT/MRI radiomics and clinical NER locally for comprehensive multi-modal synthesis. |
| **🧠 Autonomous ReAct Loop & Memory Compactor** | Dynamic tool-driven decisions with `MemoryCompactor`, enabling 16+ turns of lossless working memory compression without losing `EV-xxx` evidence chains. |
| **🔒 Kernel-Level OS Sandboxing** | Multi-platform script execution isolation:<br>• **macOS**: Seatbelt kernel sandbox (`sandbox-exec`) + physical network air-gap (`(deny default)`)<br>• **Linux**: Bubblewrap / Landlock unprivileged LSM container (`bwrap --ro-bind / / --proc /proc --dev /dev --unshare-net`)<br>• **Windows**: Mandatory Integrity Control (`Low Integrity Token` + Workspace ACL) |
| **⚖️ CritiqueEngine Anti-Hallucination Gate** | Live verification of cited **PMIDs (NCBI PubMed)** and **NCT IDs (ClinicalTrials.gov)**; validates canonical sequence lengths and flags suspect fragments. |
| **🔌 Bidirectional MCP Protocol** | Exposes all 16+ scientific tools as a standard Model Context Protocol (MCP) Server for external LLM environments (Claude Desktop / Cursor / IDEs), and dynamically mounts third-party MCP servers. |

---

### 🏗️ Architecture Flowchart

```
                             JunScience Core
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
【ReAct Inference Engine】    【Cross-Platform Sandbox】   【Bidirectional MCP Bridge】
AutonomousResearchEngine    PythonRunnerTool             McpServerBridge
EvidenceTracker (EV-xxx)    ├─ macOS: Seatbelt          (Expose as standard MCP Server)
EvidenceVerifier (Gate)     ├─ Linux: Bubblewrap        McpClientManager
PlanTracker (To-Do Tree)    └─ Win: Low Integrity       (Mount external MCP Servers)
SubagentTree (Hypotheses)
MemoryCompactor (16 turns)
CritiqueEngine (PMID/NCT)
ClinicalDataGate (Privacy)
       │                            │                            │
       └────────────────────────────┼────────────────────────────┘
                                    ▼
                 【Authoritative 4-Pillar Scientific Connectors】
       ┌────────────────────┬────────────────────┬────────────────────┬────────────────────┐
       ▼                    ▼                    ▼                    ▼
  [Literature & SOTA]   [Molecular & Structure]  [Chemistry & Pharma] [Clinical & Multimodal]
  • PubMed (NCBI)       • UniProtKB (Swiss-Prot) • ChEMBL (IC50/Ki)   • ClinicalTrials.gov (v2)
  • OpenAlex / CrossRef • RCSB PDB (Search v2)   • PubChem (PUG REST) • openFDA (FAERS/Labels)
  • arXiv (Medical AI)  • AlphaFold DB (3D)      • RxNorm / RxNav     • DailyMed (FDA SPL)
  • bioRxiv / medRxiv                            • MedlinePlus        • Local Clinical NLP
  • Papers With Code                                                  • Local 3D Radiomics
  • Hugging Face Hub
```

---

### 🚀 Quick Start

#### 1. Download Native Desktop Application (macOS / Windows / Linux)

Download pre-built installers directly from [GitHub Releases](https://github.com/Benjamin-JHou/JunScience/releases/tag/v0.1.0):
- **macOS**: `JunScience-1.0.0.dmg` (Apple Silicon & Intel)
- **Windows**: `JunScience.Setup.1.0.0.exe` (NSIS Installer) / `JunScience.1.0.0.exe` (Portable)
- **Linux**: `JunScience-1.0.0.AppImage` / `JunScience-1.0.0.deb`

#### 2. CLI Execution via Monorepo

```bash
# Clone the repository
git clone https://github.com/Benjamin-JHou/JunScience.git
cd JunScience

# Install dependencies
npm install

# Build all packages
npm run build

# Run an autonomous scientific inquiry
npm run cli research "Evaluate the allosteric selectivity of TYK2 JH2 pseudokinase vs ATP catalytic domain across JAK family kinases"
```

#### 3. TypeScript Core SDK Usage

```typescript
import { AutonomousResearchEngine, globalToolRegistry } from '@junscience/core';

const engine = new AutonomousResearchEngine({
  maxTurns: 16,
  modelProvider: activeModelProvider,
});

const turn = await engine.run(session, "Screen FAERS adverse event signals for Deucravacitinib");
console.log(turn.agentResponse);
```

---

### 🧪 Automated CI Test Matrix

JunScience runs full continuous integration tests across **macOS, Ubuntu Linux, and Windows** runners on GitHub Actions:

```bash
npm run build
npx tsx packages/core/tests/test-hardened-core.ts          # Biological connectors & MCP bridge
npx tsx packages/core/tests/test-medical-connectors.ts     # Clinical connectors & NCT verification
npx tsx packages/core/tests/test-evidence-verifier.ts      # Pre-adoption numerical sanity & anomaly checks
npx tsx packages/core/tests/test-subagent-tree.ts          # Subagent tree parallel hypothesis exploration
npx tsx packages/core/tests/test-plan-tracker.ts           # Explicit plan mode & To-Do tracker
npx tsx packages/core/tests/test-medical-ai-multimodal.ts  # Medical AI benchmarks, clinical NLP & radiomics
npx tsx packages/core/tests/test-clinical-research-loop.ts # Pure clinical ReAct research loop
npx tsx packages/core/tests/test-python-sandbox.ts         # Real OS kernel sandbox security tests
npx tsx packages/core/tests/test-memory-compactor.ts       # 16-turn lossless memory compaction
npx tsx packages/core/tests/test-skill-system.ts            # Scientific skill SOP registry
npx tsx packages/core/tests/test-steering.ts                # Real-time mid-run steering
```

---

<a name="chinese"></a>
## 🇨🇳 中文说明

### 📌 一句话定位

**JunScience 是一个专注于生物与医学领域的开源证据溯源型科研 Agent 框架**。

输入一个复杂的科学课题（例如 *“探讨 TYK2 变构抑制剂在红斑狼疮中的靶点选择性、真实世界 FAERS 不良反应信号与临床试验终点”*），JunScience 能够：
1. **显式制定 5 阶段调研计划** 与可交互 To-Do 看板。
2. 启动 **假设子 Agent 树 (SubagentTreeEngine)** 并发探索多候选靶点与机制假说。
3. 跨 **PubMed、arXiv、bioRxiv、UniProtKB、RCSB PDB、ChEMBL、PubChem、ClinicalTrials.gov v2、openFDA、DailyMed** 等权威数据库实时检索。
4. 在 **操作系统内核安全沙盒**（macOS Seatbelt / Linux Bubblewrap / Windows Low-Integrity）内运行 Python 脚本执行本地临床 NLP 与 3D CT 放射组学特征提取。
5. 经由 **生成物前置严审门禁 (EvidenceVerifier)** 执行数值物理边界与异常检测，确保计算真实有效。
6. 经由 **CritiqueEngine** 核验引用文献 PMID 与临床试验 NCT 编号的真实性。
7. 产出包含不可伪造证据锚点（`[Evidence: EV-xxx]`）与完整溯源清单的学术调研报告。

---

### ✨ 核心特性

- **🔍 生成物前置严审门禁 (`EvidenceVerifier`)**：拒绝盲目采纳计算结果，入库前强制校验物理极值（$p \in [0,1]$, $IC_{50}>0$, $HU \in [-1024,3071]$）与 NaN 异常，异常时触发自主纠错。
- **🌲 假设子 Agent 树 (`SubagentTreeEngine`)**：多假说并发分支探索，自动完成跨分支证据去重与对比矩阵合成。
- **📋 显式科学规划与流式任务追踪器 (`PlanTracker`)**：推理之初显式制定 5 阶段调研计划，全双工广播每一步任务流转（`[✔] 完成` / `[⏳] 进行中` / `[ ] 待执行`）与挂载的证据勋章。
- **🛡️ 临床数据隐私闸门 (`ClinicalDataGate`)**：原始患者文本与医学影像数据仅在本地沙盒环境内处理，未经用户交互式确认绝不向外部模型发送。
- **🔒 跨平台操作系统级内核沙盒**：macOS `sandbox-exec` 物理断网隔离、Linux `bwrap` LSM 容器化、Windows Low-Integrity MIC 访问控制，全量通过 GitHub Actions CI 验证。
- **🔌 双向 MCP 协议支持**：所有科研工具原生暴露为标准 Model Context Protocol (MCP) Server，亦可自由挂载第三方 MCP 工具。

---

## 📄 License & Acknowledgements

- Licensed under the [MIT License](LICENSE).
- For third-party notices and acknowledgements of architectural inspirations, see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
