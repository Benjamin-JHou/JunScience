# JunScience CLI 终端界面美化改造方案（面向 v1.3.0 → v1.4.0）

> 本文档给 Claude Code 使用，作为在 `JunScience_Agent` 仓库（`packages/cli`）内执行的改造任务书。已基于 GitHub 上 `Benjamin-JHou/JunScience` 的 `v1.3.0` tag 实际拉取代码核对过现状，下面的问题和文件路径都是真实存在的，不是猜测。

---

## 0. 先说结论

`packages/cli` 现在是**纯 `readline` + 手写 ANSI 转义码**实现的，`package.json` 里除了 `@junscience/core` 没有任何 UI 相关依赖。这就是为什么它看起来比 Claude Code CLI / OpenCode 粗糙——那两者都不是"多打几个颜色"这个量级的差距，而是**渲染引擎**不是一个层级的东西。

**最省成本、最贴近 Claude Code 观感的方案：给 `packages/cli` 引入 [Ink](https://github.com/vadimdemedes/ink)（React for CLI）**，因为：

- JunScience 本来就是 TypeScript / Node monorepo，Ink 是纯 npm 包，零额外运行时依赖（不像 OpenCode 那样要引入 Go 工具链）。
- Ink 的官方 README 明确写着 **Claude Code 就是用 Ink 做的**（"Who's Using Ink? — Claude Code - An agentic coding tool made by Anthropic"）。
- Google 的 **Gemini CLI**（`google-gemini/gemini-cli`，Apache-2.0，完全开源）也是用 Ink 做的，而且它的源码是**合法公开**的，可以直接当参考实现来看——这比 Claude Code 本体（官方并未开源，网上流传的"源码"是有人从 npm 包里的 sourcemap 反编译出来的，不建议作为参考或抓取对象，避免版权/合规问题）更适合当学习样本。

下面分四部分：① 升级到 1.3.0 后需要检查的问题；② 参考对象说明；③ 技术选型与依赖清单；④ 给 Claude Code 的具体执行清单。

---

## 1. 升级到 v1.3.0 后发现的、值得顺手修的问题

这些是审查代码时发现的，和"美化 CLI"无关，但既然要动 `packages/cli`，建议一起改掉：

1. **版本号硬编码，和 `package.json` 不一致**
   `packages/cli/src/ui/banner.ts` 的 `renderBanner()` 默认参数是 `version: string = '1.0.0'`，且 `packages/cli/src/ui/repl.ts` 里所有调用点都写死传入 `renderBanner('1.0.0', ...)`（包括 `/clear` 命令重绘时）。而根 `package.json`、`packages/cli/package.json`、`packages/core/package.json`、`packages/desktop/package.json` 全部已经是 `1.3.0`。
   → 用户实际看到的 banner 永远显示 `v1.0.0`，需要从 `packages/cli/package.json` 读取真实版本号（`import pkg from '../package.json' with { type: 'json' }` 或构建时注入）。

2. **`docs/screenshots/screenshot_cli_green.png`（以及 purple/blue/amber）不是真实终端截图**
   这几张图是 Electron 桌面端里的一个"CLI 风格皮肤"（React + Tailwind 渲染出来的仿终端 UI，属于 `packages/desktop` 的 6 套主题之一），**不是** `packages/cli` 这个真正的终端程序运行出来的样子。这一点值得在 README 或 issue 里明确一下，否则容易让人以为终端 CLI 已经做成那样了（这也是用户这次问"CLI 比较差"的直接原因——看了那几张图，再打开真实 CLI 落差很大）。

3. **`/help` 输出是一整段 `console.log` 硬编码文本**（`repl.ts` 里几十行 `console.log`），没有分页、没有根据终端宽度换行，终端窄一点就会错位。改成 Ink 组件后这个问题顺带解决。

4. **无 TTY 环境下会直接卡住 / 报错**：`readline.createInterface` 依赖 stdin 是交互式终端；如果 CI（`windows-latest`/`ubuntu-latest`/`macos-latest` 矩阵）或管道调用 `junscience` 且不带子命令，会进入 REPL 等待输入。这个问题在换成 Ink 后**不会自动消失**，反而要更小心处理（见第 4 节 §4.6），建议一并加上非 TTY 探测和降级。

5. **子命令（`config` / `hooks` / `skill` / `research`）各自直接 `console.log`**，和 REPL 的渲染风格是两套代码（`streamRenderer.ts` 只在 REPL 和 `research.ts` 里用，`config.ts`/`hooks.ts`/`skill.ts` 是完全独立的手写输出）。建议改造时统一到一套渲染层，避免以后各命令风格再次分裂。

---

## 2. 参考对象说明：Claude Code CLI / OpenCode CLI 到底怎么做的

| | Claude Code CLI | Gemini CLI（推荐实际参考） | OpenCode（sst/opencode） |
|---|---|---|---|
| 语言/运行时 | TypeScript + Bun | TypeScript + Node ≥20 | Go（TUI 部分）+ TypeScript/Bun（server 部分） |
| 渲染框架 | **Ink**（React for CLI，基于 Yoga 做 flexbox 布局） | **Ink**（`@jrichman/ink`，Ink 的一个 fork） | **Bubble Tea**（Elm 架构：Model/Update/View）+ **Lip Gloss**（声明式样式）+ **Bubbles**（现成组件库），均为 Charm 生态 |
| 源码是否公开 | 官方不开源；网传"源码"是从 npm 包 sourcemap 反编译得来，**不建议拿来做参考或抓取**（版权风险，且非官方口径） | **Apache-2.0，完全开源**，可放心阅读/参考 | **MIT，完全开源** |
| 架构特点 | React 组件树 + `<Static>` 组件把"已完成的历史消息"和"正在刷新的实时区域"分开渲染，避免每次 setState 全屏重绘导致的闪烁；约 130+ 组件 | 同上（`<Static>` 用于历史消息列表），另外用了 `ink-gradient` + `tinygradient` 做渐变字、`ink-spinner` 做加载动画；`packages/cli`（UI 层）与 `packages/core`（无头逻辑层）严格分离——**这个分层和 JunScience 现在 `packages/cli` vs `packages/core` 的结构是一模一样的**，可以直接对号入座 | Model/Update/View 循环；client/server 架构（TUI 只是众多客户端之一，同一个 server 还能被移动端连接） |

**结论**：JunScience 已经是 Node/TS + core-cli 分离的结构，跟 Gemini CLI 的骨架几乎一致，**没有理由绕道去学 Go/Bubble Tea 那一套**（除非以后要重写成 Go，成本完全不对等）。真正值得抄的设计模式来自 Ink 生态（Claude Code 和 Gemini CLI 共享的那套），OpenCode 的价值主要在"交互设计"层面（比如它的 mode 切换、model selector 弹窗、diff 展示这些 UX 细节），可以看截图/文档找灵感，但不要照抄代码（语言都不一样，抄不了）。

---

## 3. 技术选型：给 `packages/cli` 加的依赖

```jsonc
// packages/cli/package.json 新增 dependencies
{
  "ink": "^5",                 // React for CLI 核心渲染引擎
  "react": "^18",
  "ink-spinner": "^5",         // 工具调用 / thinking 时的加载动画
  "ink-gradient": "^3",        // banner 渐变色文字
  "ink-big-text": "^2",        // 可选：banner 用大字体 ASCII（如果想比现有手写 ASCII 更省事）
  "ink-text-input": "^6",      // REPL 输入框（替代裸 readline）
  "ink-select-input": "^6",    // /model、/skill 等的可选列表交互（上下键选择，替代现在纯文字列表）
  "ink-table": "^3",           // /tools、/skills、/model 列表用表格展示
  "cli-truncate": "^4",        // 长文本按终端宽度截断（Ink 内部也依赖，可显式声明）
  "wrap-ansi": "^9"            // 长段落按终端宽度自动换行（/help 用得上）
}
```

> 以上均为 MIT 许可，和 JunScience 现有 `LICENSE` 兼容，可以放心引入。版本号写的是当前常见的主版本线，Claude Code 落地时应以 `npm view <pkg> version` 核实一次最新稳定版再定死版本号。

---

## 4. 给 Claude Code 的具体执行清单

### 4.1 目录改造
在 `packages/cli/src/` 下新建 `ui/ink/` 目录存放新的 React/Ink 组件，**不要直接删掉旧的 `banner.ts` / `streamRenderer.ts` / `repl.ts`**，先并行实现、验证后再替换调用点，方便回滚：

```
packages/cli/src/
├── ui/
│   ├── ink/
│   │   ├── App.tsx                 # 顶层组件，管理 REPL 状态（mode/model/session）
│   │   ├── Banner.tsx              # 替代 banner.ts，用 ink-gradient 渲染 ASCII logo
│   │   ├── StatusBar.tsx           # 底部固定状态栏：mode / active model / token 用量
│   │   ├── HistoryPane.tsx         # 用 <Static> 渲染"已完成"的历史轮次，避免重绘闪烁
│   │   ├── InputPrompt.tsx         # 替代 readline，用 ink-text-input，支持斜杠命令自动补全
│   │   ├── ThinkingIndicator.tsx   # ink-spinner + 当前 phase 文案
│   │   ├── ToolCallView.tsx        # 工具调用开始/进度/完成的三段式渲染
│   │   ├── PlanTracker.tsx         # 5 阶段任务清单（[✔]/[⏳]/[ ]/[✖]），用 Box borderStyle 画框替代手写 ┌─┐
│   │   ├── ArtifactsList.tsx       # 替代 renderArtifacts
│   │   ├── CitationsList.tsx       # 替代 renderCitations
│   │   ├── HelpPane.tsx            # 替代 /help 的硬编码 console.log 长文本
│   │   └── SlashCommandMenu.tsx    # 输入 "/" 时弹出可选命令列表（参考 Claude Code / Gemini CLI 的斜杠命令面板体验）
│   ├── banner.ts                   # 保留（非 TTY 降级路径用，见 4.6）
│   ├── repl.ts                     # 保留（非 TTY 降级路径用）
│   └── streamRenderer.ts           # 保留（非 TTY 降级路径用，或被 command 层复用）
```

### 4.2 事件总线接线方式不变
`packages/core` 的 `globalEventBus`（`agent.thinking` / `tool.started` / `tool.progress` / `tool.completed` / `plan.created` / `plan.task.updated`）保持不动，`App.tsx` 用 `useEffect` 订阅这些事件、`useState`/`useReducer` 存到组件状态里，替代现在 `StreamRenderer` 直接 `console.log`。**UI 层只订阅 EventBus，不要反过来让 `packages/core` 感知 Ink**——保持现有的 core/cli 解耦边界（这一点 `AGENTS.md` 里也是这么要求的）。

### 4.3 Banner / 版本号
- 修掉 §1.1 的版本号 bug：`Banner.tsx` 从 `packages/cli/package.json` 读取真实版本（构建时用 `tsx`/`tsc` 能直接 `import` JSON，注意 `tsconfig.json` 开 `resolveJsonModule`）。
- ASCII logo 沿用现有的那个（已经画好了，不用重画），外面套一层 `<Gradient name="cristal">`（或类似配色）替代手写的 `c.brightCyan`。

### 4.4 输入框与斜杠命令
- `InputPrompt.tsx` 用 `ink-text-input` 接管输入，`SlashCommandMenu.tsx` 在检测到用户输入以 `/` 开头时，用 `ink-select-input` 弹出当前已注册的命令列表（`/model` `/plan` `/act` `/tools` `/skills` `/mcp` `/cost` `/compact` `/export` `/new` `/clear` `/exit` ……），上下键选、回车确认或继续打字过滤——这是 Claude Code / Gemini CLI 最直观的一个体验差异点，成本也不高。

### 4.5 列表类输出改用 `ink-table`
`/tools`、`/skills`、`/model`（列出 profile 列表）这几个现在是纯文字一行一行 `console.log`，改成 `ink-table` 的表格，字段对齐、加边框，观感会有明显提升，且改动量很小（数据源 `globalToolRegistry.list()` / `globalSkillRegistry.list()` / `globalProfileManager.listProfiles()` 都已经现成可用）。

### 4.6 【重要】非 TTY / CI 环境降级路径
Ink 的渲染假设 `process.stdout` 是交互式 TTY。JunScience 的 CI 矩阵（`windows-latest` / `ubuntu-latest` / `macos-latest`）和未来可能的管道调用（比如脚本里 `echo "..." | junscience`）都会跑在非 TTY 环境下。**必须**在 `packages/cli/src/index.ts` 的入口处加判断：

```ts
const isInteractive = process.stdin.isTTY && process.stdout.isTTY;

if (!command) {
  if (isInteractive) {
    await startInkRepl();       // 新的 Ink REPL
  } else {
    await startInteractiveRepl(); // 旧的 readline 版本，保留作为非交互降级路径
  }
  return;
}
```

一次性命令（`research` / `config` / `hooks` / `skill`）本身就是"跑完即退出"，不涉及长驻交互，可以视情况决定要不要也套一层 Ink（做个漂亮的进度条+结果卡片），但**必须同样做 `isInteractive` 判断**，非 TTY 时退回纯文本输出（也就是现在 `streamRenderer.ts` 那套），否则 CI 日志里会出现大量 ANSI 转义字符残留，影响可读性和日志抓取。

### 4.7 测试
- `packages/cli/tests/test-cli.ts` 现有测试要跑通；Ink 组件本身建议用 `ink-testing-library` 补几个快照测试（渲染 Banner / PlanTracker 不报错即可，不用追求覆盖率）。
- 手动验证：`npm run cli`（交互式）、`npm run cli research "..."`（一次性命令）、以及 `echo "" | npm run cli`（模拟非 TTY，验证降级路径不报错、不挂起）。

---

## 5. 从 Claude Code / Gemini CLI 身上学到的、值得优先做的三件事

按性价比排序（改动小、观感提升大的排前面）：

1. **`<Static>` 分区渲染**：把"已经结束的历史轮次"（已完成的用户提问+回答）和"当前正在刷新的内容"（thinking 动画、正在流式输出的 token）分开，历史部分用 Ink 的 `<Static>` 组件只渲染一次不再重绘，实时部分单独刷新。这是解决"每次 `console.log` 都从头滚一遍屏幕、终端疯狂闪烁"的核心手段，Claude Code 和 Gemini CLI 都是这么做的。
2. **底部固定状态栏**：常驻显示当前 mode（PLAN/ACT）、active model、以及可选的 token/cost 估算（现有 `/cost` 命令的数据源可以直接复用，从"要主动输命令查"变成"常驻可见"）。
3. **斜杠命令自动补全面板**（见 §4.4），几乎是现在所有主流 Agent CLI（Claude Code、Gemini CLI、OpenCode）的标配体验。

---

## 6. 参考链接

- Ink（React for CLI）：https://github.com/vadimdemedes/ink
- Gemini CLI（Apache-2.0，Ink 实现，推荐直接读源码里的 `packages/cli/src/ui/`）：https://github.com/google-gemini/gemini-cli
- OpenCode（Go + Bubble Tea/Lip Gloss/Bubbles，UX 设计可参考）：https://github.com/sst/opencode
- Bubble Tea / Lip Gloss / Bubbles（Charm 生态，仅作为设计模式参考，不适用于本次 Node.js 技术栈）：https://github.com/charmbracelet

---

## 附：本次审查方式说明

以上第 1 节的问题清单，是直接 `git clone --branch v1.3.0` 拉取 `Benjamin-JHou/JunScience` 仓库、逐文件核对 `packages/cli/src/**`、根/子包 `package.json` 版本号、以及 `docs/screenshots/` 下的截图得出的，不是根据以往对话记忆推断的，可以直接对照仓库当前状态核实。
