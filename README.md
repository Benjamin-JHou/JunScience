# JunScience (君科) 🧬 🔬

<div align="center">

**专注于生物与医学领域的证据溯源型科研 Agent（分子生物 + 临床证据 + 医学多模态）**

[![Cross-Platform CI](https://github.com/Benjamin-JHou/JunScience/actions/workflows/test.yml/badge.svg)](https://github.com/Benjamin-JHou/JunScience/actions/workflows/test.yml)
[![Desktop Release](https://github.com/Benjamin-JHou/JunScience/actions/workflows/release.yml/badge.svg)](https://github.com/Benjamin-JHou/JunScience/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-Model_Context_Protocol-green.svg)](https://modelcontextprotocol.io)
[![Platform: macOS | Linux | Windows](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-purple.svg)]()

</div>

---

## 📌 一句话定位

**JunScience 是一个真正由真实数据与本地沙盒驱动的生物医学科研 Agent**：输入一个复杂生医课题（如 *“探讨 TYK2 变构抑制剂在红斑狼疮中的靶点选择性、真实世界 FAERS 不良反应信号与临床试验终点”* 或 *“医学影像多模态大模型在胸部 X 光肺炎分类中的公开基准与特征提取”*），Agent 自动进行多轮动态规划，跨 **PubMed、arXiv、medRxiv、Papers With Code、Hugging Face Hub、ClinicalTrials.gov、openFDA、RxNorm、DailyMed、MedlinePlus、UniProtKB、ChEMBL、PubChem、RCSB PDB** 实时检索，在**操作系统内核沙盒**内运行 Python 脚本执行本地临床 NLP、影像放射组学特征计算与统计检验，经由 **CritiqueEngine 针对真实文献 PMID 与临床试验 NCT 编号的真实性自核查**，产出带不可伪造证据锚点（`[Evidence: EV-xxx]`）与完整溯源清单的高质量学术报告。

---

## ✨ 核心特性

| 核心模块 | 架构与能力实现 |
| :--- | :--- |
| **🔍 Codex 风格证据前置验证门禁** | 拒绝盲目采纳计算结果：Python 脚本计算数值、统计量、生化常数生成后，必须先经过 **EvidenceVerifier** 进行物理极值（$p \in [0,1]$, $IC_{50}>0$, $HU \in [-1024,3071]$）与计算异常（NaN/ZeroDivision）校验，通过后方可打标 `[Evidence: EV-xxx]`；异常时自动拦截并触发 Agent 自我纠错。 |
| **🌲 DeepSeek Harness 假设子 Agent 树** | 支持对复杂生医课题进行多假说并发分支探索：父 Agent 动态分发隔离的 Subagent 并行验证多靶点/多机制假说，自动完成跨分支证据去重归一化，生成结构化**假说对比矩阵（Comparison Matrix）**。 |
| **📋 显式 Plan 模式与 To-Do 追踪器** | 告别黑盒生成：在推理之初显式制定 5 阶段科研计划（Plan），通过 EventBus 实时向 CLI 终端与桌面端 UI 广播每一步任务状态（`[✔] 完成` / `[⏳] 进行中` / `[ ] 待执行`）与挂载的证据勋章。 |
| **🛡️ 临床数据隐私闸门 (Privacy Gate)** | 严格遵循数据出境安全红线：真实的临床病历文本与医学影像数据**默认仅在本地 Python 沙盒内完成 NLP 实体提取与 Radiomics 放射组学特征计算**；未经用户明确授权，绝不静默向外部大模型 API 上传任何原始敏感数据。 |
| **👁️ 多模态联合推理能力** | 原生兼容文本与图像多模态输入（支持 OpenAI 与 Anthropic 规范的图片块封装）；支持将本地沙盒提取生成的病理/影像切片及结构化特征安全送入多模态大模型进行深度综合研判。 |
| **🧠 动态自主科研 ReAct 循环** | 摒弃死板阶段流，纯粹由上一步工具返回的实测数据驱动下一轮决策；集成 **MemoryCompactor**，压缩冗余推理并无损锚定 `EV-xxx` 证据链，支持 16+ 轮长链深度探索。 |
| **🔒 操作系统级内核沙盒隔离** | Python 科学计算脚本在操作系统内核安全边界内运行：<br>• **macOS**：Seatbelt 内核沙盒（`sandbox-exec`）+ 物理级网络阻断（Air-gapped）<br>• **Linux**：Bubblewrap / Landlock 非特权 LSM 沙盒（`bwrap --ro-bind / / --proc /proc --dev /dev --unshare-net`）<br>• **Windows**：Mandatory Integrity Control（`Low Integrity Token` + `Workspace ACL`） |
| **⚖️ 真实性 Critique 严审门禁** | 严防学术幻觉：在生成报告前，强制联网核验所有引用的 **PMID（NCBI PubMed）** 与 **NCT 编号（ClinicalTrials.gov）**；校验蛋白质氨基酸序列长度合理性，拦截虚构试验与未审核截断片段。 |
| **🔌 MCP 协议双向互通** | 原生兼容 **Model Context Protocol (MCP)**：既能将 JunScience 全部科研工具作为 MCP Server 暴露给 Claude Desktop / Cursor / Codex 复用，也可即插即用挂载外部第三方 MCP 工具。 |

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
EvidenceVerifier (前置门禁) ├─ Linux: Bubblewrap        McpClientManager
PlanTracker (To-Do 清单)    └─ Win: Low Integrity       (挂载外部 MCP Server)
SubagentTree (假设树)
MemoryCompactor (16轮)
CritiqueEngine (PMID/NCT)
ClinicalDataGate (隐私闸门)
       │                            │                            │
       └────────────────────────────┼────────────────────────────┘
                                    ▼
                         【权威生医数据与多模态连接层】
       ┌────────────────────┬────────────────────┬────────────────────┬────────────────────┐
       ▼                    ▼                    ▼                    ▼
  [文献与基准检索]       [分子与结构生物学]      [化学与药理活性]       [临床医学与多模态]
  • PubMed (NCBI)       • UniProtKB (Swiss)  • ChEMBL (IC50/Ki)   • ClinicalTrials.gov (v2)
  • OpenAlex / CrossRef • RCSB PDB (v2)      • PubChem (PUG REST) • openFDA (Labels/FAERS)
  • arXiv (Medical AI)  • AlphaFold DB (3D)                       • RxNorm / RxNav (NLM)
  • medRxiv / bioRxiv                                             • DailyMed (FDA SPL)
  • Papers With Code                                              • MedlinePlus Connect
  • Hugging Face Hub                                              • 本地临床 NLP (沙盒)
                                                                  • 本地影像放射组学 (沙盒)
```

---

## 🚀 快速开始

### 方式一：下载桌面客户端（推荐）

从 [GitHub Releases](https://github.com/Benjamin-JHou/JunScience/releases) 下载对应操作系统的安装包：
- **macOS**：`JunScience-x.y.z.dmg`（原生适配 Apple Silicon 及 Intel 芯片）
- **Windows**：`JunScience-Setup-x.y.z.exe`
- **Linux**：`JunScience-x.y.z.AppImage` / `.deb`

> ⚠️ **关于无签名安装包的运行提示（Gatekeeper / SmartScreen）**：  
> 本项目当前为开源社区版，暂未购买昂贵的商业代码签名证书：
> - **macOS 用户**：首次打开若提示“无法验证开发者”，请前往 **系统设置 > 隐私与安全性**，点击 **“仍要打开”** 即可正常运行；
> - **Windows 用户**：若触发 SmartScreen 提示，请点击 **“更多信息” > “仍要运行”**。

---

### 方式二：通过 npm 全局安装 CLI

```bash
# 全局安装 JunScience CLI
npm install -g @junscience/cli

# 1. 配置你的模型 API 端点与 Key
junscience profile add

# 2. 激活该配置
junscience profile switch "MyModel"

# 3. 运行你的科学研究课题
junscience research "评估德克伐替尼在银屑病中的真实世界不良反应信号（FAERS）与当前临床试验终点"
```

---

## 🧪 自动化测试与持续集成 (CI Matrix)

本项目配置了完整的跨平台 GitHub Actions CI Matrix，已在 **三大操作系统真实虚拟机** 上 100% 验证通过：

```bash
# 本地运行全量测试套件
npm run build
npx tsx packages/core/tests/test-hardened-core.ts          # 生物连接器与 MCP 桥接测试
npx tsx packages/core/tests/test-medical-connectors.ts     # 临床医学连接器与 NCT 严审测试
npx tsx packages/core/tests/test-medical-ai-multimodal.ts  # 医学 AI 基准、临床 NLP、影像放射组学测试
npx tsx packages/core/tests/test-clinical-research-loop.ts # 纯临床科研 ReAct 循环实测
npx tsx packages/core/tests/test-python-sandbox.ts         # 真实跨平台内核沙盒安全测试
npx tsx packages/core/tests/test-memory-compactor.ts       # 16 轮无损记忆压缩测试
npx tsx packages/core/tests/test-skill-system.ts            # 科学技能注册表测试
npx tsx packages/core/tests/test-steering.ts                # 实时插话控制测试
```

---

## 📋 已知限制与诚实说明

1. **真实沙盒验证状态**：macOS Seatbelt、Linux Bubblewrap（带 SUID/userns 隔离）以及 Windows Low-Integrity Mandatory Integrity Control（MIC）均已在 GitHub Actions 官方 `macos-latest`、`ubuntu-latest`、`windows-latest` 云端真实机器上跑通并建立 CI 门禁。
2. **临床数据隐私保障**：原始临床文本与影像文件仅在本地沙盒环境内处理；非结构化原始患者数据向外部模型 API 发送前必须经过用户交互式确认。
3. **医学术语库范围**：已接入 ClinicalTrials.gov v2、openFDA、RxNorm、DailyMed、MedlinePlus 等公开免授权接口；商业闭源库（如完整商业版 SNOMED CT 授权分发集）未内置。

---

## 📄 License & 致谢

- 本项目采用 [MIT License](LICENSE) 开源协议。
- 本项目借鉴与参考的优秀开源项目（OpenScience、DeepSeek Harness、Pi、Codex）版权声明与条款详见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。
