import React, { createContext, useContext, useState } from 'react';
import { AgentSession, AgentStatus, AgentMessage, ToolExecution } from '../types/agent';
import { mockDefaultSession, mockDefaultTools, mockDefaultArtifacts, mockDefaultCitations } from '../data/mockResearch';
import { globalResearchEngine } from '../runtime/research-loop/ResearchEngine';
import { globalEventBus } from '../runtime/core/EventBus';
import { globalSessionManager } from '../runtime/core/SessionManager';

interface AgentContextType {
  currentSession: AgentSession;
  activeView: 'home' | 'workspace';
  status: AgentStatus;
  submitPrompt: (promptText: string) => Promise<void>;
  resetSession: () => void;
  openProject: (projectId: string, title: string) => void;
  setActiveView: (view: 'home' | 'workspace') => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const paramView = urlParams.get('view');

  const [currentSession, setCurrentSession] = useState<AgentSession>(mockDefaultSession);
  const [activeView, setActiveView] = useState<'home' | 'workspace'>(
    paramView === 'workspace' ? 'workspace' : 'home'
  );
  const [status, setStatus] = useState<AgentStatus>('idle');

  const resetSession = () => {
    const newRuntimeSession = globalSessionManager.createSession('New Scientific Exploration');
    setCurrentSession({
      id: newRuntimeSession.id,
      title: 'New Scientific Exploration',
      createdAt: newRuntimeSession.createdAt,
      updatedAt: newRuntimeSession.updatedAt,
      status: 'idle',
      messages: [],
    });
    setStatus('idle');
    setActiveView('home');
  };

  const openProject = (projectId: string, title: string) => {
    if (projectId === 'proj-1') {
      setCurrentSession(mockDefaultSession);
    } else {
      setCurrentSession({
        id: projectId,
        title: title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'completed',
        messages: [
          {
            id: `msg-${Date.now()}-user`,
            role: 'user',
            content: `Review research progress and recent artifacts for ${title}.`,
            timestamp: 'Just now',
          },
          {
            id: `msg-${Date.now()}-agent`,
            role: 'agent',
            status: 'completed',
            timestamp: 'Just now',
            content: `### Project Overview: **${title}**\n\nAll automated pipeline analyses and target screenings have converged. Pre-computed molecular dynamics and literature mining results are indexed below.`,
            toolExecutions: mockDefaultTools.slice(0, 2),
            artifacts: mockDefaultArtifacts.slice(0, 2),
            citations: mockDefaultCitations.slice(0, 2),
          },
        ],
      });
    }
    setActiveView('workspace');
  };

  const submitPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const runtimeSession = globalSessionManager.createSession(
      promptText.length > 40 ? promptText.slice(0, 37) + '...' : promptText
    );
    const sessionId = runtimeSession.id;

    const userMessage: AgentMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const agentMessageId = `msg-${Date.now()}-agent`;
    const initialAgentMessage: AgentMessage = {
      id: agentMessageId,
      role: 'agent',
      status: 'thinking',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: 'Formulating scientific research hypothesis and searching foundational databases...',
      toolExecutions: [],
      artifacts: [],
      citations: [],
    };

    setCurrentSession({
      id: sessionId,
      title: runtimeSession.title,
      createdAt: runtimeSession.createdAt,
      updatedAt: runtimeSession.updatedAt,
      status: 'thinking',
      messages: [...currentSession.messages, userMessage, initialAgentMessage],
    });

    setActiveView('workspace');
    setStatus('thinking');

    // Subscribe to EventBus for this session
    const unsubscribe = globalEventBus.onAll((event) => {
      if (event.sessionId !== sessionId) return;

      if (event.type === 'agent.thinking') {
        setStatus('thinking');
      } else if (event.type === 'tool.started') {
        setStatus('tool_calling');
        const toolExecution: ToolExecution = {
          id: event.payload.toolId,
          toolName: event.payload.toolName,
          category: event.payload.category as any,
          description: `Executing ${event.payload.toolName}...`,
          status: 'running',
          logs: [`Input: ${JSON.stringify(event.payload.input)}`],
        };

        setCurrentSession((prev) => ({
          ...prev,
          messages: prev.messages.map((m) => {
            if (m.id === agentMessageId) {
              return {
                ...m,
                status: 'tool_calling',
                toolExecutions: [...(m.toolExecutions || []), toolExecution],
              };
            }
            return m;
          }),
        }));
      } else if (event.type === 'tool.progress') {
        setCurrentSession((prev) => ({
          ...prev,
          messages: prev.messages.map((m) => {
            if (m.id === agentMessageId) {
              const updatedTools = (m.toolExecutions || []).map((t) => {
                if (t.id === event.payload.toolId) {
                  return {
                    ...t,
                    logs: [...t.logs, event.payload.log],
                  };
                }
                return t;
              });
              return { ...m, toolExecutions: updatedTools };
            }
            return m;
          }),
        }));
      } else if (event.type === 'tool.completed') {
        setCurrentSession((prev) => ({
          ...prev,
          messages: prev.messages.map((m) => {
            if (m.id === agentMessageId) {
              const updatedTools = (m.toolExecutions || []).map((t) => {
                if (t.id === event.payload.toolId) {
                  return event.payload.execution;
                }
                return t;
              });
              return { ...m, toolExecutions: updatedTools };
            }
            return m;
          }),
        }));
      } else if (event.type === 'artifact.created') {
        setCurrentSession((prev) => ({
          ...prev,
          messages: prev.messages.map((m) => {
            if (m.id === agentMessageId) {
              return {
                ...m,
                artifacts: [...(m.artifacts || []), event.payload.artifact],
              };
            }
            return m;
          }),
        }));
      } else if (event.type === 'citation.created') {
        setCurrentSession((prev) => ({
          ...prev,
          messages: prev.messages.map((m) => {
            if (m.id === agentMessageId) {
              return {
                ...m,
                citations: [...(m.citations || []), event.payload.citation],
              };
            }
            return m;
          }),
        }));
      } else if (event.type === 'agent.message.completed') {
        setStatus('completed');
        setCurrentSession((prev) => ({
          ...prev,
          status: 'completed',
          messages: prev.messages.map((m) => {
            if (m.id === agentMessageId) {
              return {
                ...m,
                status: 'completed',
                content: event.payload.fullContent,
              };
            }
            return m;
          }),
        }));
      }
    });

    try {
      await globalResearchEngine.executeAutonomousResearch(promptText, sessionId);
    } finally {
      unsubscribe();
    }
  };

  return (
    <AgentContext.Provider
      value={{
        currentSession,
        activeView,
        status,
        submitPrompt,
        resetSession,
        openProject,
        setActiveView,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
