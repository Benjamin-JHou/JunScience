# JunScience Bug 报告与修复方案

> 基于 `packages/desktop/` 桌面应用源码分析，覆盖 UI 层和底层逻辑层。

# 总结

| # | Bug | 严重程度 | 类型 |
|---|---|---|---|
| 1 | 用户信息硬编码 | 中 | UI / 数据持久化 |
| 2 | 假历史项目记录 | 中 | UI / 数据持久化 |
| 3 | Launch Agent 按钮无效 | 高 | 功能 / IPC 集成 |
| 4 | Research Plan 静态假数据 | 中 | UI / 状态同步 |
| 5 | openProject 注入假数据 | 中 | 逻辑 / 数据 |
| 6 | submitPrompt 返回假结论 | 高 | 逻辑 / 功能 |
| 7 | 设置无法持久化 | 高 | 数据持久化 |
| 8 | ⌘N 快捷键不重置会话 | 低 | 交互一致性 |
| 9 | ContextPanel 消失 | 低 | UI / 布局 |
| 10 | 时间戳硬编码 | 低 | 数据 |
| 11 | fs 模块在浏览器崩溃 | 高 | 兼容性 |
| 12 | 权限白名单失效 | 中 | 安全 |
| 13 | React state 可变性 | 中 | React 最佳实践 |


## Bug 1：左下角用户信息硬编码，无法编辑

**现象：** 打开 exe 程序后，左下角始终显示 `"Junyu Zhou"` / `"Pro Plan"`，点击后只打开设置弹窗，无法修改用户名。

**原因分析：**

* 文件 `packages/desktop/src/components/shell/Sidebar.tsx` 第 156–165 行，用户信息被硬编码：

```tsx
<span>JZ</span>                         // 头像缩写
<span className="...">Junyu Zhou</span> // 用户名
<span className="...">Pro Plan</span>   // 订阅计划
```

* 点击触发的是 `setIsSettingsOpen(true)`，但 `SettingsModal` 里没有账户信息编辑入口，只有 Model API、外观、快捷键三个 Tab。
* 没有任何用户配置持久化机制（无 localStorage、无 IPC 存储）。

**解决方案：**

1. 在 `NavContext` 或新建 `UserContext` 中添加用户信息 state（`userName`、`userPlan`、`avatarText`），用 `localStorage` 持久化。
2. 在 `SettingsModal` 新增 `"Account"` Tab，提供用户名和计划编辑表单。
3. `Sidebar.tsx` 从 context 读取用户信息，不再硬编码。
4. 默认值改为 `"Researcher"` / `"Free Plan"`，首次启动引导用户设置。

---

## Bug 2：首次安装打开即显示假的历史项目记录

**现象：** 全新安装后，Home 页面 `"Recent Projects"` 区域直接显示 4 条假项目（`"Autoimmune Target Discovery"` 等），像是有使用历史。

**原因分析：**

* 文件 `packages/desktop/src/data/mockProjects.ts` 硬编码了 6 条假项目数据。
* `packages/desktop/src/components/home/RecentProjects.tsx` 第 10 行直接渲染：

```tsx
const recentFour = mockProjects.slice(0, 4);
```

* 没有判断是否为首次启动，也没有从持久化存储读取真实项目记录的逻辑。
* `ResearchStats` 同样硬编码了 `"Projects: 12, Analyses: 48, Papers: 256, Hours: 120+"`（`mockStats.ts`）。

**解决方案：**

1. 新建 `ProjectContext`，管理真实项目列表，用 `localStorage` 或 Electron IPC 持久化。
2. 首次启动时项目列表为空，显示引导占位文案（`"Start your first research project"`）。
3. `RecentProjects` 从 context 读取，当列表为空时渲染空状态组件。
4. `ResearchStats` 的数值从 context 动态计算，而非硬编码。
5. 删除或重命名 `mockProjects.ts` / `mockStats.ts`，仅在 Demo/Showcase 模式下使用。

---

## Bug 3：侧边栏功能页的 “Launch Agent Workflow” 按钮点击无效

**现象：** 点击侧边栏的 Literature、Data Analysis、Experiment Design 等功能后，页面底部的 `"Launch Agent Workflow"` 按钮点击后无响应或仅跳转到 workspace，但不执行真实任务。

**原因分析：**

* 文件 `packages/desktop/src/components/views/FunctionalPlaceholders.tsx` 第 204 行：

```tsx
<button onClick={() => submitPrompt(config.prompt)}>
  Launch Agent Workflow
</button>
```

* `submitPrompt` 来自 `AgentContext`（`AgentContext.tsx` 第 159–228 行），其逻辑为：
  * 如果 `window.junscience?.agent` 存在（Electron 环境），调用 IPC。
  * 否则走 browser fallback（第 197–222 行）：用 `setTimeout` 延迟后注入 `mockDefaultTools` / `mockDefaultArtifacts` / `mockDefaultCitations`，返回一段假文案。
* 核心问题：Electron main 进程的 IPC handler（`packages/desktop/electron/ipc/agentIpc.ts`）可能未正确注册，或 `AutonomousResearchEngine` 未接入，导致 `window.junscience.agent` 为 `undefined`，始终走 mock fallback 路径。
* 即使走 fallback，也只是显示假数据，没有真正执行科研工作流。

**解决方案：**

1. 检查 `packages/desktop/electron/main.ts` 和 `agentIpc.ts`，确认 `window.junscience.agent` 的 preload bridge 正确注入。
2. 在 `AgentContext.submitPrompt` 中，当 IPC 不可用时给出明确的错误提示，而不是静默走 mock。
3. 为按钮添加 loading 状态和错误反馈，点击后如果执行失败要显示原因。
4. 如果是 Demo 模式，在 UI 上明确标注 `"Demo Mode (No Real Execution)"`，避免误导用户。

---

## Bug 4：右侧 Context Panel 的 Research Plan 任务列表是静态假数据

**现象：** 右侧面板的 `"Research Plan & To-Do"` 始终显示 5 条预设任务（task-1 到 task-5），状态固定（2 completed、1 in_progress、2 pending），不随实际操作变化。

**原因分析：**

* 文件 `packages/desktop/src/components/shell/ContextPanel.tsx` 第 38–44 行：

```tsx
const [tasks, setTasks] = useState([
  { id: 'task-1', title: '...', status: 'completed', evidenceIds: ['EV-1', 'EV-2'] },
  { id: 'task-2', title: '...', status: 'completed', evidenceIds: ['EV-3'] },
  { id: 'task-3', title: '...', status: 'in_progress', evidenceIds: ['EV-4'] },
  ...
]);
```

* `setTasks` 从未被调用，状态永远不会更新。
* 底层 `PlanTracker`（`packages/core/src/research-loop/PlanTracker.ts`）有完整的事件驱动逻辑，会通过 `EventBus` 发射 `plan.task.updated` 事件，但前端没有监听这些事件来更新 UI。

**解决方案：**

1. 在 `AgentContext` 中监听 `plan.created`、`plan.task.updated`、`plan.task.completed` 事件。
2. 将 plan 状态存入 context，`ContextPanel` 从 context 读取而非局部 `useState`。
3. 当没有活跃 session 时，显示空状态（`"No active research plan"`）而非假任务列表。
4. 移除硬编码的 `EV-1 ~ EV-4` evidence ID。

---

## Bug 5：openProject 对非 proj-1 项目生成假对话内容

**现象：** 点击 `"Recent Projects"` 中的任意项目，进入 workspace 后会显示一段假的研究综合报告，内容与 TYK2/STAT4/SLE 强相关，与实际点击的项目无关。

**原因分析：**

* 文件 `packages/desktop/src/context/AgentContext.tsx` 第 126–157 行，`openProject` 函数：

```tsx
const openProject = (projectId: string, title: string) => {
  if (projectId === 'proj-1') {
    setCurrentSession(mockDefaultSession); // 加载完整假数据
  } else {
    // 其他项目也注入 mockDefaultTools/Artifacts/Citations
    toolExecutions: mockDefaultTools.slice(0, 2),
    artifacts: mockDefaultArtifacts.slice(0, 2),
    citations: mockDefaultCitations.slice(0, 2),
  }
}
```

* 无论打开哪个项目，都注入相同的 mock 数据（TYK2/STAT4/SLE 相关的假工具执行记录和假文献）。
* 没有从持久化存储加载真实项目数据的逻辑。

**解决方案：**

1. 实现项目持久化（IPC + 本地文件/SQLite），`openProject` 从存储层加载真实数据。
2. 在持久化机制就绪前，对非 `proj-1` 项目显示空 workspace + `"No data for this project"` 提示。
3. 移除对 `mockDefaultTools` 等的硬编码注入。

---

## Bug 6：submitPrompt 的 browser fallback 返回固定的假研究结论

**现象：** 在没有 Electron IPC 的环境下（如 `npm run dev` 浏览器预览），提交任何 prompt 后，2.5 秒后返回一段固定的假文案：`"Automated analysis for ... completed. Data tables, volcano plots..."`

**原因分析：**

* 文件 `packages/desktop/src/context/AgentContext.tsx` 第 211–222 行：

```tsx
setTimeout(() => {
  setStatus('completed');
  last.content = `### Scientific Research Synthesis\n\nAutomated analysis for "${promptText}" completed...`;
}, 2500);
```

* 无论输入什么，返回内容只是把 `promptText` 拼进模板字符串，其余全是固定的假结论。
* 工具执行记录直接注入 `mockDefaultTools`（3 条 TYK2/STAT4 相关的假记录）。

**解决方案：**

1. Browser fallback 模式应在 UI 明确标注 `"Demo Mode"`。
2. 如果没有配置真实模型 API，提示用户先去 Settings 配置。
3. 移除假数据注入，改为显示 `"No model configured"` 错误状态。

---

## Bug 7：SettingsModal 无法持久化保存的模型配置

**现象：** 在设置中配置了 API Key 和 Base URL，点击 Save 后重启程序，配置丢失。

**原因分析：**

* 文件 `packages/desktop/src/components/common/SettingsModal.tsx` 第 134–148 行，`handleSaveProfile`：

```tsx
if (window.junscience?.model) {
  const res = await window.junscience.model.saveProfile(editingProfile);
} else {
  setSaveMessage('Profile saved (Local state)'); // 仅内存
}
```

* Browser fallback 分支只更新了 React state，刷新即丢失。
* 即使 Electron 分支调用了 IPC，需检查 `modelIpc.ts` 是否正确写入 `~/.junscience/` 持久化文件。
* `SecureStore`（`packages/core/src/config/SecureStore.ts`）声称用 AES-256-GCM 加密，但需验证 IPC bridge 是否正确接入。

**解决方案：**

1. Browser 模式下用 `localStorage` 持久化 profile（API Key 可加密后存储或提示仅在桌面端保存）。
2. Electron 模式下确认 `modelIpc.ts → ProfileManager → SecureStore` 链路完整。
3. 启动时自动加载已保存的 profile 并设为 active。

---

## Bug 8：New Chat 快捷键 ⌘N 只切换页面，不创建新 session

**现象：** 按 `⌘N / Ctrl+N` 后，只是把 `activeSection` 设为 `'home'`，但没有真正重置会话。

**原因分析：**

* 文件 `packages/desktop/src/context/NavContext.tsx` 第 38–40 行：

```tsx
if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
  e.preventDefault();
  setActiveSection('home'); // 仅切换页面
}
```

* 没有调用 `AgentContext.resetSession()`，当前 session 的 messages 仍然保留。
* 而 Sidebar 的 `"New Chat"` 按钮（`Sidebar.tsx` 第 55–58 行）正确调用了 `resetSession()` + `setActiveSection('home')`。
* 快捷键和按钮行为不一致。

**解决方案：**

1. 在 `NavContext` 中无法直接调用 `resetSession`（跨 context），改为在 `AppShell` 或 `AgentContext` 中监听快捷键。
2. 或者将 `resetSession` 提升到更上层 context，或通过 ref/callback 传递。
3. 确保快捷键行为与按钮一致：先 `resetSession()`，再 `setActiveSection('home')`。

---

## Bug 9：ContextPanel 仅在 home section 显示，workspace 模式下消失

**现象：** 进入 workspace（发送 prompt 后）右侧 Context Panel 消失，无法查看研究计划和工具。

**原因分析：**

* 文件 `packages/desktop/src/components/shell/AppShell.tsx` 第 57 行：

```tsx
{viewMode !== 'showcase' && activeSection === 'home' && <ContextPanel />}
```

* `ContextPanel` 只在 `activeSection === 'home'` 时渲染。
* 但 `submitPrompt` 会调用 `setActiveView('workspace')`（`AgentContext.tsx` 第 189 行），此时 `activeSection` 仍是 `'home'`，`activeView` 变为 `'workspace'`。
* 实际上 `activeView` 的判断在 `AppShell` 第 46–50 行，渲染 `DesktopWorkspaceView`，但 `ContextPanel` 的条件只看 `activeSection`，不看 `activeView`。
* 需确认：workspace 模式下是否应保留 `ContextPanel`？从交互设计看应该保留。

**解决方案：**

1. 修改 `AppShell` 第 57 行，在 workspace 模式也显示 `ContextPanel`。

原代码：

```tsx
{viewMode !== 'showcase' && activeSection === 'home' && <ContextPanel />}
```

可根据设计意图调整条件，使其覆盖 `activeView === 'workspace'`。

> 截图中的示例“改为”代码与原条件视觉上相同，因此真正修复时应重点检查 `activeSection` 是否在 `submitPrompt` 时被改变，以及是否应显式加入 `activeView === 'workspace'` 条件。

2. 如果设计意图是 workspace 下也显示，确认条件逻辑覆盖 `activeView === 'workspace'`。

---

## Bug 10：mockDefaultSession 的 createdAt 使用未来日期

**现象：** mock session 的时间戳是 `2026-08-27T10:14:00Z`，在当前日期之前或之后会造成时间显示混乱。

**原因分析：**

* 文件 `packages/desktop/src/data/mockResearch.ts` 第 142–143 行：

```ts
createdAt: '2026-08-27T10:14:00Z',
updatedAt: '2026-08-27T10:15:30Z',
```

* 硬编码的日期会随时间推移变得过时，显示为“很久以前”或未来时间。

**解决方案：**

1. 使用 `new Date().toISOString()` 动态生成时间戳。
2. 或彻底移除 mock session，改为空 session。

---

## Bug 11：EvidenceVerifier 直接操作文件系统（fs.existsSync）

**现象：** `EvidenceVerifier` 在浏览器环境中会崩溃，因为它调用了 Node.js 的 `fs` 模块。

**原因分析：**

* 文件 `packages/core/src/research-loop/EvidenceVerifier.ts` 第 2 行：

```ts
import fs from 'node:fs';
```

* 第 337 行 `fs.existsSync(filePath)` 在浏览器/Electron renderer 中不可用（除非 `nodeIntegration` 开启）。
* 该模块被 `@junscience/core` 导出，desktop renderer 通过 import 引入时会报错。

**解决方案：**

1. 将文件系统检查逻辑移到 Electron main 进程，通过 IPC 暴露。
2. 或在 renderer 端使用 try/catch 包裹，降级为跳过文件完整性检查。
3. 更好的方案：将 `EvidenceVerifier` 的文件检查部分抽象为 `ArtifactStorage` 接口，在 main 进程实现，并通过 IPC 调用。

---

## Bug 12：PermissionManager 的 NETWORK 白名单过窄

**现象：** `PermissionManager` 的 NETWORK 权限只允许 7 个硬编码域名，实际工具可能需要访问更多端点。

**原因分析：**

* 文件 `packages/core/src/sandbox/PermissionManager.ts` 第 29–39 行：

```ts
this.policies.set('NETWORK', {
  defaultAction: 'allow',
  allowedPrefixes: [
    'https://eutils.ncbi.nlm.nih.gov',
    'https://rest.uniprot.org',
    // ... 只有 7 个
  ],
});
```

* `defaultAction: 'allow'` 意味着不在白名单里的也会被允许，因为相关判断逻辑会在白名单检查之前直接返回 `true`。
* 因此白名单在当前逻辑下形同虚设，安全策略没有实际生效。

**解决方案：**

1. 如果要严格沙盒，将 `defaultAction` 改为 `'ask'` 或 `'deny'`。
2. 白名单检查应在 `defaultAction === 'allow'` 返回之前执行。
3. 修正逻辑顺序：先检查 `deniedPrefixes`，再检查 `allowedPrefixes`，最后再根据 `defaultAction` 决定。

---

## Bug 13：AgentContext 直接修改 state 中的对象，违反 React 不可变性原则

**现象：** `handleRuntimeEvent` 中直接修改 `lastMsg` 的属性，可能导致 React 无法正确检测状态变化，从而不重新渲染 UI。

**原因分析：**

* 文件 `packages/desktop/src/context/AgentContext.tsx` 第 56–70 行：

```tsx
const messages = [...prev.messages];
const lastMsg = messages[messages.length - 1];
lastMsg.toolExecutions = updatedTools; // 直接修改原对象
```

* `[...prev.messages]` 只是数组浅拷贝，数组内部对象的引用没有改变。
* 因此直接修改 `lastMsg` 的属性实际上仍然会 mutate 原 state 中的对象。
* React 的 diff 过程可能无法可靠感知该层级对象的变化，容易造成 UI 不更新、状态引用污染或后续调试困难。

**解决方案：**

1. 对需要修改的消息对象创建新对象，再放回新数组：

```tsx
const messages = [...prev.messages];
const lastMsg = {
  ...messages[messages.length - 1],
};

lastMsg.toolExecutions = updatedTools;
messages[messages.length - 1] = lastMsg;
```

2. 第 78–84、92–96、101–106 行中类似的：

```tsx
lastMsg.artifacts = ...
lastMsg.citations = ...
lastMsg.content = ...
```

同样需要按不可变更新方式修复。

---

# 总结

| # | Bug | 严重程度 | 类型 |
|---|---|---|---|
| 1 | 用户信息硬编码 | 中 | UI / 数据持久化 |
| 2 | 假历史项目记录 | 中 | UI / 数据持久化 |
| 3 | Launch Agent 按钮无效 | 高 | 功能 / IPC 集成 |
| 4 | Research Plan 静态假数据 | 中 | UI / 状态同步 |
| 5 | openProject 注入假数据 | 中 | 逻辑 / 数据 |
| 6 | submitPrompt 返回假结论 | 高 | 逻辑 / 功能 |
| 7 | 设置无法持久化 | 高 | 数据持久化 |
| 8 | ⌘N 快捷键不重置会话 | 低 | 交互一致性 |
| 9 | ContextPanel 消失 | 低 | UI / 布局 |
| 10 | 时间戳硬编码 | 低 | 数据 |
| 11 | fs 模块在浏览器崩溃 | 高 | 兼容性 |
| 12 | 权限白名单失效 | 中 | 安全 |
| 13 | React state 可变性 | 中 | React 最佳实践 |

**根本原因：** 项目由 AI 从零生成，大量使用 mock 数据填充 UI，但未实现真实的数据持久化层和 IPC 集成。前端组件、状态管理和后端引擎之间存在断裂，导致功能不可用。

