# JunScience — Hooks 层 + AGENTS.md + 扩充 Skill 库

## 背景

现有的 `EvidenceVerifier`、`ClinicalDataGate` 这类"不管 agent 怎么想都必须
执行的强制检查",目前是硬编码埋在 `AutonomousResearchEngine` 内部,不是
一个独立、可列表查看、可插拔的系统。同时项目级的持久指令目前没有统一存放
的地方,Skill 库(4 个)相对于"科研 agent"这个定位明显偏薄。这次做三件事:
把强制检查重构成正式的 Hooks 系统、新增 `AGENTS.md` 项目级约定文件、
扩充 Skill 库。

---

## 任务 1:Hooks 系统(把隐藏在引擎里的强制检查显性化)

### 目标

任何"不管 agent 推理结果如何,都必须执行"的检查,都应该是一个独立、可在
一个地方看到全貌的 Hook,而不是散落在 `AutonomousResearchEngine` 内部代码
的各个角落。

### 具体设计

在 `packages/core/src/hooks/` 下新增:

- `HookRegistry.ts` —— 管理所有已注册 Hook,按事件类型分类触发
- `types.ts` —— 定义 Hook 事件类型,至少覆盖:
  - `PreToolUse` —— 工具调用前(比如:调用 `ClinicalNlpTool`/
    `MedicalImagingTool` 前,检查是否已获得 `ClinicalDataGate` 确认)
  - `PostToolUse` —— 工具调用完成后(把现有的 `EvidenceVerifier` 校验
    逻辑迁移到这里,作为一个标准 Hook,而不是引擎内部直接调用的函数)
  - `SessionStart` —— 会话开始时(比如:加载用户的 Skill/配置)
  - `Stop` —— 一轮 ReAct 循环/整个研究任务结束时(比如:检查是否所有
    `FLAGGED`/`REJECTED` 的证据都有对应的处理记录,不能不了了之)
- 内置 Hook 清单(把现有逻辑迁移过来,不是新写):
  1. `evidence-verifier` (PostToolUse) —— 迁移自现有 `EvidenceVerifier.ts`
  2. `clinical-data-gate` (PreToolUse) —— 迁移自现有 `ClinicalDataGate.ts`
  3. `secret-redaction` (PreToolUse,新增) —— 任何要发送给外部模型 API
     的内容,先过一遍基础的敏感信息扫描(API Key 格式、明显的身份证号/
     卡号格式),命中就阻断并要求确认,防止类似之前 API Key 意外贴进
     报告的情况在 agent 自动化流程里重演
  4. `evidence-completeness-check` (Stop,新增) —— 研究任务结束时,检查
     报告里引用的每个 `[Evidence: EV-x]` 编号,是否都能在 `EvidenceTracker`
     里找到对应记录,防止"报告写了引用,但证据链其实断掉了"这种情况

### 要求

- 现有 `EvidenceVerifier`/`ClinicalDataGate` 的校验逻辑本身不用重写,只是
  搬到 Hook 的调用方式下,保持行为不变——这是架构重构,不是能力重做。
- Hook 清单要能通过一个命令查看(比如 CLI 里加一个 `junscience hooks list`),
  用户能看到"现在有哪些强制关卡在生效",不是只有翻代码才知道。
- 写一份 `test-hooks-system.ts`,验证每个 Hook 在该触发的事件点确实被
  触发了,而不只是测试 Hook 本身的校验逻辑(这部分逻辑已经在之前的测试
  里验证过了)。

---

## 任务 2:新增 `AGENTS.md`(项目级约定文件,不用 Claude Code 私有格式)

### 目标

JunScience 定位是模型无关,不应该采用绑定单一厂商的项目约定文件格式
(比如 Claude Code 的 `CLAUDE.md`)。改用 `AGENTS.md` 这个跨工具通用的
开放约定——这样不管用户配置的是哪个模型/哪个上游 agent 工具,只要支持
这个约定,都能读到同一份项目上下文。

### 内容要求

在仓库根目录新增 `AGENTS.md`,至少包含:
- JunScience 项目的定位和架构总览(可以从 README 提炼精简版,不要整段
  复制)
- 关键设计原则(比如"临床数据默认本地处理,发送外部 API 前必须走
  `clinical-data-gate` 这个 Hook"这类硬性规则,让任何读取这份文件的
  agent 都能遵守,不用每次靠人重新交代)
- Skill/Hook 的目录结构说明,方便以后新增时知道该放在哪
- 明确写清楚:这份文件是给"操作/开发 JunScience 这个项目本身的 agent"
  看的(比如 Claude Code 在帮你写代码时),不是给"JunScience 运行时自己
  跑科研任务"用的——这是两个不同的读者,不要混在一起。

---

## 任务 3:扩充 Skill 库

现有 4 个(`pathway-enrichment`、`bibliometric-analysis`、
`sar-pharmacophore-mapping`、`protein-domain-architect`)保留,新增以下
按类别排好优先级的 skill,每个都要是真实可用、有明确输入输出的,不要为了
凑数量做空壳:

**分子与结构生物学**
- `sequence-alignment` —— 多序列比对(调用 Python 沙盒里的 Biopython/
  MUSCLE 或类似工具),给出保守区域、突变位点标注
- `structure-superposition` —— 两个 PDB/AlphaFold 结构的叠合比较,输出
  RMSD 和关键差异区域

**化学信息学**
- `admet-prediction` —— 基于现成开源工具(比如 RDKit 内置的 ADMET 相关
  描述符)给出小分子的基础成药性评估,不要求接商业化 ADMET 预测服务
- `chemical-similarity-search` —— 基于分子指纹的相似化合物检索

**统计与生物信息学**
- `differential-expression-analysis` —— 差异表达分析(基础统计方法,不
  要求接类似 DESeq2 的完整生信流程,先做出可用的最小版本)
- `survival-analysis` —— Kaplan-Meier 曲线、Cox 回归,这对临床结局分析
  很基础也很常用
- `meta-analysis-forest-plot` —— 多个研究/试验结果的合并分析与森林图

**临床**
- `adverse-event-signal-detection` —— 基于 openFDA FAERS 数据的不成比例
  分析(ROR/PRR 这类经典药物警戒信号检测方法)
- `clinical-trial-eligibility-matching` —— 给定一段患者特征描述,匹配
  ClinicalTrials.gov 上符合纳排标准的活跃试验

**文献**
- `systematic-review-prisma` —— 系统综述的 PRISMA 流程图生成与筛选记录
- `citation-network-mapping` —— 引用网络可视化,识别领域内的关键节点
  文献

**影像**
- `radiomics-feature-extraction` —— 把已有 `MedicalImagingTool` 的能力
  包装成一个标准 skill,给出清晰的使用场景说明(哪些问题该用这个)

**写作与可复现性**
- `manuscript-formatting` —— 输出符合目标期刊格式要求的 LaTeX/Word 稿件
  框架(这个对你自己的 MASLD 论文写作也有直接用处)
- `figure-generation` —— 发表级图表制作(matplotlib/seaborn 规范化样式,
  符合期刊图表要求的分辨率和格式)
- `reproducibility-packaging` —— 把一次分析用到的代码、参数、随机种子、
  环境依赖打包记录下来,保证结果可复现——这是科研诚信的基本要求,建议
  优先级不要排在最后

### 要求

- 每个 skill 遵循现有 4 个 skill 已经在用的格式规范(SKILL.md + 必要脚本),
  不要另起一套格式。
- 不要求一次性做完所有列出的 skill,按上面的类别顺序做,做一批测一批。
- 每个新 skill 至少要有一个真实、非合成的使用示例(用公开数据跑一次,
  贴出实际产出),不能只写"已实现"就算完成。

---

## 执行顺序

先做任务 1(Hooks 重构)——这是把现有能力显性化,风险最低,而且做完
之后任务 3 里新增的 skill 才有地方挂载"这个 skill 用到的强制检查"。
任务 2(AGENTS.md)可以并行做,内容不多。任务 3(扩充 skill)排最后,
按文档里的类别顺序,一批一批交付,不要一次性全部同时开工。
