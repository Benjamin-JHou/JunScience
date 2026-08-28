# JunScience (君科) 🧬 🔬

<div align="center">

**专注于生物与医学领域的证据溯源型科研 Agent**

[![Cross-Platform CI](https://github.com/JunScience/JunScience_Agent/actions/workflows/test.yml/badge.svg)](https://github.com/JunScience/JunScience_Agent/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-Model_Context_Protocol-green.svg)](https://modelcontextprotocol.io)
[![Platform: macOS | Linux | Windows](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-purple.svg)]()

</div>

---

## 📌 一句话定位

**JunScience 是一个真正由真实数据驱动的生物医学科研 Agent**：输入一个复杂科研问题（如 *“探讨 TYK2 变构抑制剂在红斑狼疮肾炎中的作用机制与靶点选择性”*），Agent 自动进行多轮动态推理，跨 **PubMed、ClinicalTrials.gov、openFDA、UniProt、ChEMBL、PubChem、RCSB PDB** 等权威数据库实时检索，在**操作系统级内核沙盒**内运行 Python 脚本执行统计计算与构效分析，经由 **CritiqueEngine 针对真实文献 PMID 与临床试验 NCT 编号的真实性自核查**，最终产出带严格证据锚点（`[Evidence: EV-xxx]`）与完整溯源清单的学术报告。

---

## ✨ 核心特性

| 核心模块 | 架构与能力实现 |
| :--- | :--- |
| **🌐 权威生医数据连接器** | • **医学**：ClinicalTrials.gov API v2（试验阶段/纳排标准）、openFDA（说明书/黑框警告/FAERS 不良事件）、RxNorm（RxCUI/DDI 相互作用）、DailyMed（官方 SPL 标签）、MedlinePlus<br>• **生物**：UniProtKB（Swiss-Prot 权威条目三级回退）、ChEMBL（IC50/Ki 抑制剂活性与靶点）、PubChem（PUG REST 两阶段分子式/SMILES）、RCSB PDB（Search v2 晶体结构与 AlphaFold 3D 模型） |
| **🧠 动态自主科研循环** | 摒弃写死阶段的模板化流水线，采用纯粹由上一步工具返回结果驱动的 ReAct 循环；集成 **MemoryCompactor**，压缩中间冗余推理并无损锚定 `EV-xxx` 证据，支持 16+ 轮长链深度探索。 |
| **🛡️ 跨平台内核沙盒隔离** | Python 科学脚本在操作系统内核安全边界内运行：<br>• **macOS**：Seatbelt 内核沙盒（`sandbox-exec`）+ 物理级网络阻断（Air-gapped）<br>• **Linux**：Bubblewrap / Landlock 非特权 LSM 沙盒（`bwrap --ro-bind / / --unshare-net`）<br>• **Windows**：Mandatory Integrity Control（`Low Integrity Token` + `Job Object`） |
| **⚖️ 真实性 Critique 严审门禁** | 拒绝大模型学术幻觉：在生成报告前，强制联网核验所有引用的 **PMID（NCBI PubMed）** 与 **NCT 编号（ClinicalTrials.gov）**；校验蛋白质氨基酸序列长度合理性，拦截未审核截断片段。 |
| **🔌 MCP 协议双向互通** | 原生兼容 **Model Context Protocol (MCP)**：既能将 JunScience 全部科研工具作为 MCP Server 暴露给 Claude Desktop / Cursor / Codex 复用，也可即插即用挂载外部第三方 MCP 工具。 |
| **🧭 Mid-Run Steering 实时调整** | 支持在 Agent 运行中途随时队列插入 Guidance，下一轮 ReAct 循环自动吸纳并动态调整研究航向。 |
| **🔒 通用 Model/API Vault** | 本地加密存储（AES-256-GCM / 跨平台系统 Keychain），零硬编码，一键无缝接入 OpenAI、Anthropic、DeepSeek、Ollama 以及任意兼容 OpenAI 规范的私有化/中转 API 端点。 |

---

## 🚀 快速开始

### 方式一：下载桌面客户端（推荐）

从 [GitHub Releases](https://github.com/JunScience/JunScience_Agent/releases) 下载对应操作系统的安装包：
- **macOS**：`JunScience-x.y.z.dmg`（原生适配 Apple Silicon 及 Intel 芯片）
- **Windows**：`JunScience-Setup-x.y.z.exe`
- **Linux**：`JunScience-x.y.z.AppImage` / `.deb`

> ⚠️ **关于无签名安装包的运行提示（Gatekeeper / SmartScreen）**：  
> 本项目当前为开源社区版，暂未购买商业代码签名证书：
> - **macOS 用户**：首次打开若提示“无法验证开发者”，请前往 **系统设置 > 隐私与安全性**，点击 **“仍要打开”** 即可正常运行；
> - **Windows 用户**：若触发 SmartScreen 蓝窗提示，请点击 **“更多信息” > “仍要运行”**。

---

### 方式二：通过 npm 全局安装 CLI

如果你更习惯在终端环境或服务器上使用，可直接通过 npm 安装 CLI 工具：

```bash
# 全局安装 JunScience CLI
npm install -g @junscience/cli

# 1. 配置你的模型 API 端点与 Key（以通用 OpenAI 格式或中转端点为例）
junscience profile add
# 提示输入:
#   Profile Name: MyModel
#   Base URL    : https://api.openai.com/v1 (或第三方中转端点)
#   API Key     : sk-xxxx...
#   Model       : gpt-4o (或 deepseek-reasoner, claude-3-5-sonnet)

# 2. 激活该配置
junscience profile switch "MyModel"

# 3. 运行你的第一个科学研究课题
junscience research "分析 TYK2 激酶抑制剂（如 Deucravacitinib）在红斑狼疮中的靶点选择性与临床试验进展"
```

---

## 🏗️ 架构全景

```
                             JunScience Core
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
【ReAct 推理引擎】          【跨平台安全沙盒】          【双向 MCP 桥接层】
AutonomousResearchEngine    PythonRunnerTool             McpServerBridge
EvidenceTracker (EV-x)      ├─ macOS: Seatbelt          (暴露为标准 MCP Server)
MemoryCompactor (16轮)      ├─ Linux: Bubblewrap        McpClientManager
CritiqueEngine (PMID/NCT)   └─ Win: Low Integrity       (挂载外部 MCP Server)
       │                            │                            │
       └────────────────────────────┼────────────────────────────┘
                                    ▼
                         【权威生医数据连接层】
       ┌────────────────────────────┬────────────────────────────┐
       ▼                            ▼                            ▼
  [文献与试验]                 [靶点与结构]                 [化学与药理]
  • PubMed (E-utilities)       • UniProtKB (Swiss-Prot)     • ChEMBL (IC50/Ki)
  • ClinicalTrials.gov (v2)    • RCSB PDB (Search v2)       • PubChem (PUG REST)
  • MedlinePlus Connect        • AlphaFold DB (3D Model)    • openFDA / RxNorm
```

---

## 🧪 自动化测试与持续集成 (CI)

本项目配置了完整的跨平台 GitHub Actions CI Matrix（覆盖 `macos-latest`、`ubuntu-latest`、`windows-latest`）：

```bash
# 本地运行全量验证套件
npm run build
npx tsx packages/core/tests/test-hardened-core.ts      # 生物连接器与 MCP 测试
npx tsx packages/core/tests/test-medical-connectors.ts   # 医学临床连接器与 NCT 严审测试
npx tsx packages/core/tests/test-memory-compactor.ts     # 记忆压缩测试
npx tsx packages/core/tests/test-python-sandbox.ts       # 真实内核沙盒安全测试
npx tsx packages/core/tests/test-skill-system.ts          # 技能注册表测试
npx tsx packages/core/tests/test-steering.ts              # 实时插话控制测试
```

---

## 📋 已知限制与诚实说明

1. **术语库授权范围**：本项目接入的所有医学数据库（ClinicalTrials.gov, openFDA, RxNorm, DailyMed, MedlinePlus）均为公开免授权端点。商业许可库（如完整 UMLS Metathesaurus、SNOMED CT、ICD-10-CM 授权分发集）未内置。
2. **代码签名状态**：目前 Desktop 发布版本未附加商业签名证书，首次运行需遵循上述步骤手动授权。
3. **沙盒环境依赖**：
   - Linux 环境推荐系统安装 `bubblewrap`（现代桌面发行版均已内置）；若极简 Docker 容器缺少 `bwrap`，会退化为工作区独立进程隔离模式并给予明确警示。
   - Windows 环境利用操作系统原生 Mandatory Integrity Control（MIC），不强依赖 Docker。

---

## 📄 License & 致谢

- 本项目采用 [MIT License](LICENSE) 开源协议。
- 本项目借鉴与参考的优秀开源项目（OpenScience、DeepSeek Harness、Pi、Codex）版权声明与条款详见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。
