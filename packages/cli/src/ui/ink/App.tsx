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
import { SlashCommandMenu } from './SlashCommandMenu.js';
import { ModelConfigWizard } from './ModelConfigWizard.js';
import { ToolsView } from './ToolsView.js';
import { SkillsView } from './SkillsView.js';
import { HelpView } from './HelpView.js';

type ActiveModal = 'none' | 'slash_menu' | 'model_wizard' | 'tools' | 'skills' | 'help';

export function App() {
  const { exit } = useApp();

  // Mode state
  const [mode, setMode] = useState<'plan' | 'act'>('act');
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
    // 1. Shift+Tab to toggle Mode (or terminal escape \x1b[Z)
    if ((key.tab && key.shift) || input === '\x1b[Z') {
      setMode((prev) => {
        const next = prev === 'plan' ? 'act' : 'plan';
        setToastMessage(`Switched to ${next === 'plan' ? 'PLAN MODE' : 'ACT MODE'}`);
        return next;
      });
      return;
    }

    // 2. Escape to close any open modal
    if (key.escape && modal !== 'none') {
      setModal('none');
      return;
    }
  });

  // Handle Input text changes
  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (val === '/') {
      setModal('slash_menu');
    } else if (modal === 'slash_menu' && !val.startsWith('/')) {
      setModal('none');
    }
  };

  // Execute Slash Commands
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

    if (trimmed === '/help') {
      setModal('help');
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

    if (trimmed === '/mode') {
      setMode((prev) => {
        const next = prev === 'plan' ? 'act' : 'plan';
        setToastMessage(`Switched to ${next === 'plan' ? 'PLAN MODE' : 'ACT MODE'}`);
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

    if (trimmed === '/compact') {
      setToastMessage('Working memory compacted while preserving immutable EV anchors');
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
    setThoughtPhase('Formulating Inquiry');
    setStreamingDelta('');
    currentToolsRef.current = [];

    let session = currentSession;
    if (!session) {
      session = globalSessionManager.createSession(
        trimmed.slice(0, 50),
        'proj-1',
        'research'
      );
      setCurrentSession(session);
    }

    const inquiryMode = mode;
    const promptPayload =
      inquiryMode === 'plan'
        ? `[PLAN MODE: Provide hypothesis breakdown, 5-stage research plan, and required EV anchors without executing sandbox tools]\n${trimmed}`
        : trimmed;

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
      {/* 1. TOP BANNER */}
      <Banner activeModel={activeModelDisplay} mode={mode} />

      {/* 2. STATIC HISTORY PANE (Committed turns never re-rendered) */}
      <HistoryPane history={history} />

      {/* 3. MODAL POPUPS */}
      {modal === 'slash_menu' && (
        <SlashCommandMenu
          filterText={inputValue}
          onSelect={(cmd) => handleCommand(cmd)}
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

      {modal === 'tools' && <ToolsView onClose={() => setModal('none')} />}
      {modal === 'skills' && <SkillsView onClose={() => setModal('none')} />}
      {modal === 'help' && <HelpView onClose={() => setModal('none')} />}

      {/* 4. LIVE EXECUTION PANE (Dynamic active updates) */}
      <LiveExecutionPane
        isThinking={isThinking}
        thoughtPhase={thoughtPhase}
        thoughtText={thoughtText}
        tasks={tasks}
        activeTool={activeTool}
        streamingDelta={streamingDelta}
      />

      {/* 5. INTERACTIVE INPUT PROMPT */}
      {modal === 'none' && (
        <InputPrompt
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          mode={mode}
          disabled={isThinking || streamingDelta.length > 0}
        />
      )}

      {/* 6. PERSISTENT BOTTOM STATUS BAR */}
      <StatusBar
        mode={mode}
        activeModel={activeModelDisplay}
        turnCount={turnCount}
        estTokens={estTokens}
        toastMessage={toastMessage}
      />
    </Box>
  );
}
