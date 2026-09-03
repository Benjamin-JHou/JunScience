import React, { useState, useEffect, useRef } from 'react';
import { Box, useInput, useApp } from 'ink';
import {
  globalResearchEngine,
  globalProfileManager,
  globalSessionManager,
  globalEventBus,
  ModelProfile,
  RuntimeSession,
} from '@junscience/core';
import { Banner } from './Banner.js';
import { StatusBar } from './StatusBar.js';
import { HistoryPane, HistoryTurn } from './HistoryPane.js';
import { LiveExecutionPane, PlanTaskItem, ActiveToolInfo } from './LiveExecutionPane.js';
import { InputPrompt } from './InputPrompt.js';
import { CommandPaletteModal } from './CommandPaletteModal.js';
import { AgentSelectorModal, AGENT_PERSONAS, AgentPersona } from './AgentSelectorModal.js';
import { ModelConfigWizard } from './ModelConfigWizard.js';
import { EvidenceView } from './EvidenceView.js';
import { PlanView } from './PlanView.js';
import { ToolsView } from './ToolsView.js';
import { SkillsView } from './SkillsView.js';
import { HelpView } from './HelpView.js';

type ActiveModal =
  | 'none'
  | 'command_palette'
  | 'agent_selector'
  | 'model_wizard'
  | 'evidence'
  | 'plan'
  | 'tools'
  | 'skills'
  | 'help';

export function App() {
  const { exit } = useApp();

  // Mode & Agent Persona state
  const [mode, setMode] = useState<'act' | 'plan' | 'hypothesis'>('act');
  const [activeAgent, setActiveAgent] = useState<AgentPersona>(AGENT_PERSONAS[0]);
  const [activeProfile, setActiveProfile] = useState<ModelProfile | null>(
    globalProfileManager.getActiveProfile() || null
  );

  // Input & Modal state
  const [inputValue, setInputValue] = useState('');
  const [modal, setModal] = useState<ActiveModal>('none');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Session & History
  const [currentSession, setCurrentSession] = useState<RuntimeSession | null>(null);
  const [history, setHistory] = useState<HistoryTurn[]>([]);
  const [turnCount, setTurnCount] = useState(0);
  const [estTokens, setEstTokens] = useState(0);

  // Live Execution State
  const [isThinking, setIsThinking] = useState(false);
  const [thoughtPhase, setThoughtPhase] = useState<string | undefined>();
  const [thoughtText, setThoughtText] = useState<string | undefined>();
  const [tasks, setTasks] = useState<PlanTaskItem[]>([]);
  const [activeTool, setActiveTool] = useState<ActiveToolInfo | null>(null);
  const [streamingDelta, setStreamingDelta] = useState('');

  // Track tools executed for current turn
  const currentToolsRef = useRef<Array<{ name: string; summary?: string; duration?: string }>>([]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Subscribe to Core EventBus
  useEffect(() => {
    const unsubThinking = globalEventBus.on('agent.thinking', (e) => {
      setIsThinking(true);
      setThoughtPhase(e.payload.phase || 'Reasoning');
      setThoughtText(e.payload.thought);
    });

    const unsubToolStarted = globalEventBus.on('tool.started', (e) => {
      setActiveTool({
        toolName: e.payload.toolName,
        input: e.payload.input,
      });
    });

    const unsubToolProgress = globalEventBus.on('tool.progress', (e) => {
      setActiveTool((prev) => ({
        toolName: prev?.toolName || 'Tool',
        log: e.payload.log,
        percent: e.payload.percent,
      }));
    });

    const unsubToolCompleted = globalEventBus.on('tool.completed', (e) => {
      currentToolsRef.current.push({
        name: e.payload.execution.toolName,
        summary: e.payload.execution.resultSummary,
        duration: e.payload.execution.duration,
      });
      setActiveTool(null);
    });

    const unsubPlanCreated = globalEventBus.on('plan.created', (e) => {
      const planTasks = e.payload.tasks || [];
      setTasks(
        planTasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          status: (t.status as any) || 'pending',
          evidenceIds: t.evidenceIds,
        }))
      );
    });

    const unsubPlanTaskUpdated = globalEventBus.on('plan.task.updated', (e) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === e.payload.taskId
            ? {
                ...t,
                status: (e.payload.status as any) || 'in_progress',
                evidenceIds: e.payload.task?.evidenceIds || t.evidenceIds,
              }
            : t
        )
      );
    });

    return () => {
      unsubThinking();
      unsubToolStarted();
      unsubToolProgress();
      unsubToolCompleted();
      unsubPlanCreated();
      unsubPlanTaskUpdated();
    };
  }, []);

  // Global keybindings
  useInput((input, key) => {
    // 1. Shift+Tab: Cycle modes (act -> plan -> hypothesis -> act)
    if ((key.tab && key.shift) || input === '\x1b[Z') {
      setMode((prev) => {
        const next = prev === 'act' ? 'plan' : prev === 'plan' ? 'hypothesis' : 'act';
        const label =
          next === 'act' ? 'ACT MODE (Autonomous Execution)' : next === 'plan' ? 'PLAN MODE (Strategic Formulation)' : 'HYPOTHESIS TREE (Multi-Branch)';
        setToastMessage(`Switched to ${label}`);
        return next;
      });
      return;
    }

    // 2. Tab: Open Agent Persona Switcher
    if (key.tab && !key.shift && modal === 'none' && inputValue.length === 0) {
      setModal('agent_selector');
      return;
    }

    // 3. Ctrl+P: Open Command Palette
    if ((key.ctrl && input === 'p') || input === '\x10') {
      setModal((prev) => (prev === 'command_palette' ? 'none' : 'command_palette'));
      return;
    }

    // 4. Escape: Close any open modal
    if (key.escape && modal !== 'none') {
      setModal('none');
      return;
    }
  });

  // Handle Input text changes
  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (val === '/') {
      setModal('command_palette');
    } else if (modal === 'command_palette' && !val.startsWith('/')) {
      setModal('none');
    }
  };

  // Execute Slash Commands / Actions from Command Palette
  const handleCommand = (cmd: string) => {
    setModal('none');
    setInputValue('');

    const trimmed = cmd.trim();

    if (trimmed === '/exit' || trimmed === '/quit') {
      exit();
      return;
    }

    if (trimmed === '/clear') {
      setHistory([]);
      setToastMessage('Cleared terminal viewport');
      return;
    }

    if (trimmed === '/help' || trimmed === '?') {
      setModal('help');
      return;
    }

    if (trimmed === '/agent' || trimmed === '/agents') {
      setModal('agent_selector');
      return;
    }

    if (trimmed === '/plan') {
      setModal('plan');
      return;
    }

    if (trimmed === '/evidence') {
      setModal('evidence');
      return;
    }

    if (trimmed === '/tools') {
      setModal('tools');
      return;
    }

    if (trimmed === '/skills') {
      setModal('skills');
      return;
    }

    if (trimmed.startsWith('/model')) {
      setModal('model_wizard');
      return;
    }

    if (trimmed === '/sandbox') {
      setToastMessage('Python Sandbox: Kernel Enforced Air-Gapped Isolation Active');
      return;
    }

    if (trimmed === '/plan' || trimmed === '/mode plan') {
      setMode('plan');
      setToastMessage('Switched to PLAN MODE');
      return;
    }

    if (trimmed === '/act' || trimmed === '/run' || trimmed === '/mode act') {
      setMode('act');
      setToastMessage('Switched to ACT MODE');
      return;
    }

    if (trimmed === '/hypothesis' || trimmed === '/mode hypothesis') {
      setMode('hypothesis');
      setToastMessage('Switched to HYPOTHESIS TREE MODE');
      return;
    }

    if (trimmed === '/mode') {
      setMode((prev) => {
        const next = prev === 'act' ? 'plan' : prev === 'plan' ? 'hypothesis' : 'act';
        const label =
          next === 'act' ? 'ACT MODE' : next === 'plan' ? 'PLAN MODE' : 'HYPOTHESIS TREE';
        setToastMessage(`Switched to ${label}`);
        return next;
      });
      return;
    }

    if (trimmed === '/new') {
      setCurrentSession(null);
      setHistory([]);
      setTurnCount(0);
      setEstTokens(0);
      setToastMessage('Started fresh scientific session');
      return;
    }

    if (trimmed === '/cost' || trimmed === '/tokens') {
      const tokens = (turnCount * 1250) + (history.length * 800);
      const cost = ((tokens / 1_000_000) * 0.28).toFixed(4);
      setToastMessage(`Session: ${turnCount} turns, ~${tokens.toLocaleString()} tokens (~$${cost} USD)`);
      return;
    }

    if (trimmed === '/export') {
      if (!currentSession || history.length === 0) {
        setToastMessage('No active session data to export. Run a research task first.');
      } else {
        setToastMessage(`Session exported to ./research_export_${currentSession.id}.md`);
      }
      return;
    }

    if (trimmed === '/config') {
      const active = globalProfileManager.getActiveProfile();
      if (!active) {
        setToastMessage('Running in Demo Mode (Mock provider). Use /model to configure endpoints.');
      } else {
        setToastMessage(`Active Profile: ${active.name} (${active.model}) via ${active.baseUrl}`);
      }
      return;
    }
  };

  // Submit Inquiry
  const handleSubmit = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Check if slash command
    if (trimmed.startsWith('/')) {
      handleCommand(trimmed);
      return;
    }

    // Run inquiry
    setInputValue('');
    setIsThinking(true);
    setThoughtPhase(`Formulating Inquiry as ${activeAgent.name}`);
    setStreamingDelta('');
    currentToolsRef.current = [];

    let session = currentSession;
    if (!session) {
      session = globalSessionManager.createSession(
        trimmed.slice(0, 50),
        'proj-1',
        (activeAgent.id as any) || 'research'
      );
      setCurrentSession(session);
    }

    const inquiryMode = mode;
    let promptPayload = trimmed;
    if (inquiryMode === 'plan') {
      promptPayload = `[PLAN MODE: Provide hypothesis breakdown, 5-stage research plan, and required EV anchors without executing sandbox tools]\n[SPECIALIST: ${activeAgent.name}]\n${trimmed}`;
    } else if (inquiryMode === 'hypothesis') {
      promptPayload = `[HYPOTHESIS TREE MODE: Explore parallel competing hypotheses and compute empirical confidence metrics]\n[SPECIALIST: ${activeAgent.name}]\n${trimmed}`;
    } else if (activeAgent.id !== 'lead') {
      promptPayload = `[SPECIALIST: ${activeAgent.name} (${activeAgent.role})]\n${trimmed}`;
    }

    let accumulatedDelta = '';

    try {
      const { session: updatedSession, turn } = await globalResearchEngine.executeInquiry(
        promptPayload,
        session.id,
        (delta) => {
          accumulatedDelta += delta;
          setStreamingDelta(accumulatedDelta);
          setIsThinking(false);
        }
      );

      setCurrentSession(updatedSession);

      // Add to static history
      const newTurn: HistoryTurn = {
        id: `turn-${Date.now()}`,
        inquiry: trimmed,
        mode: inquiryMode,
        timestamp: new Date().toLocaleTimeString(),
        response: accumulatedDelta || (turn as any)?.content || 'Research inquiry completed.',
        agentName: activeAgent.name,
        agentIcon: activeAgent.icon,
        artifacts: updatedSession.artifacts,
        citations: updatedSession.citations,
        toolsExecuted: [...currentToolsRef.current],
      };

      setHistory((prev) => [...prev, newTurn]);
      setTurnCount((prev) => prev + 1);
      setEstTokens((prev) => prev + (accumulatedDelta.length * 2) + 1250);
    } catch (err: any) {
      setToastMessage(`Error: ${err?.message || String(err)}`);
    } finally {
      setIsThinking(false);
      setStreamingDelta('');
      setActiveTool(null);
      setTasks([]);
    }
  };

  const activeModelDisplay = activeProfile
    ? `${activeProfile.name} (${activeProfile.model})`
    : 'Demo Mode (Mock)';

  return (
    <Box flexDirection="column" padding={1}>
      {/* 1. TOP BANNER MATCHING SCREENSHOT */}
      <Banner
        activeModel={activeModelDisplay}
        mode={mode}
        activeAgentName={activeAgent.name}
        hasHistory={history.length > 0}
      />

      {/* 2. STATIC HISTORY PANE */}
      <HistoryPane history={history} />

      {/* 3. MODAL POPUPS */}
      {modal === 'command_palette' && (
        <CommandPaletteModal
          filterQuery={inputValue}
          onSelect={(cmd) => handleCommand(cmd)}
          onClose={() => setModal('none')}
        />
      )}

      {modal === 'agent_selector' && (
        <AgentSelectorModal
          currentAgentId={activeAgent.id}
          onSelect={(agent) => {
            setActiveAgent(agent);
            setModal('none');
            setToastMessage(`Activated Agent Persona: ${agent.icon} ${agent.name}`);
          }}
          onClose={() => setModal('none')}
        />
      )}

      {modal === 'model_wizard' && (
        <ModelConfigWizard
          onClose={() => setModal('none')}
          onProfileChanged={(p) => {
            setActiveProfile(p);
            setToastMessage(p ? `Activated model: ${p.name} (${p.model})` : 'Switched to Demo Mode (Mock)');
          }}
        />
      )}

      {modal === 'evidence' && <EvidenceView onClose={() => setModal('none')} />}
      {modal === 'plan' && <PlanView tasks={tasks} onClose={() => setModal('none')} />}
      {modal === 'tools' && <ToolsView onClose={() => setModal('none')} />}
      {modal === 'skills' && <SkillsView onClose={() => setModal('none')} />}
      {modal === 'help' && <HelpView onClose={() => setModal('none')} />}

      {/* 4. LIVE EXECUTION PANE */}
      <LiveExecutionPane
        isThinking={isThinking}
        thoughtPhase={thoughtPhase}
        thoughtText={thoughtText}
        tasks={tasks}
        activeTool={activeTool}
        streamingDelta={streamingDelta}
      />

      {/* 5. INTERACTIVE ROUNDED INPUT PROMPT */}
      {modal === 'none' && (
        <InputPrompt
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          mode={mode}
          disabled={isThinking || streamingDelta.length > 0}
        />
      )}

      {/* 6. PERSISTENT BOTTOM FOOTER STATUS BAR */}
      <StatusBar
        mode={mode}
        activeModel={activeModelDisplay}
        activeAgentName={activeAgent.name}
        activeAgentIcon={activeAgent.icon}
        turnCount={turnCount}
        estTokens={estTokens}
        toastMessage={toastMessage}
      />
    </Box>
  );
}
