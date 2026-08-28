import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgentSession, AgentStatus, AgentMessage, ToolExecution } from '../types/agent';
import { mockDefaultSession, mockDefaultTools, mockDefaultArtifacts, mockDefaultCitations } from '../data/mockResearch';
import type { RuntimeEvent } from '@junscience/core';

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

  // Listen to IPC events from Electron Main process
  useEffect(() => {
    if (window.junscience?.agent) {
      const unsub = window.junscience.agent.onEvent((event: RuntimeEvent) => {
        handleRuntimeEvent(event);
      });
      return unsub;
    }
  }, []);

  const handleRuntimeEvent = (event: RuntimeEvent) => {
    switch (event.type) {
      case 'agent.started':
        setStatus('thinking');
        break;
      case 'agent.thinking':
        setStatus('thinking');
        break;
      case 'tool.started':
        setStatus('tool_calling');
        break;
      case 'tool.completed':
        // Update tool execution in active message
        setCurrentSession((prev) => {
          const messages = [...prev.messages];
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.role === 'agent') {
            const existingTools = lastMsg.toolExecutions || [];
            const exec = event.payload.execution;
            const updatedTools: ToolExecution[] = [
              ...existingTools.filter((t) => t.toolName !== exec.toolName),
              {
                id: exec.id,
                toolName: exec.toolName,
                category: exec.category as any,
                description: exec.description,
                status: 'completed',
                duration: exec.duration,
                resultSummary: exec.resultSummary,
                logs: exec.logs,
              },
            ];
            lastMsg.toolExecutions = updatedTools;
          }
          return { ...prev, messages };
        });
        break;
      case 'artifact.created':
        setCurrentSession((prev) => {
          const messages = [...prev.messages];
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.role === 'agent') {
            const art = event.payload.artifact;
            lastMsg.artifacts = [...(lastMsg.artifacts || []), art as any];
          }
          return { ...prev, messages };
        });
        break;
      case 'citation.created':
        setCurrentSession((prev) => {
          const messages = [...prev.messages];
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.role === 'agent') {
            const cit = event.payload.citation;
            lastMsg.citations = [...(lastMsg.citations || []), cit as any];
          }
          return { ...prev, messages };
        });
        break;
      case 'agent.message.completed':
        setStatus('completed');
        setCurrentSession((prev) => {
          const messages = [...prev.messages];
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.role === 'agent') {
            lastMsg.content = event.payload.fullContent;
            lastMsg.status = 'completed';
          }
          return { ...prev, status: 'completed', messages };
        });
        break;
    }
  };

  const resetSession = () => {
    const newSessionId = `sess-${Date.now()}`;
    setCurrentSession({
      id: newSessionId,
      title: 'New Scientific Exploration',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

    setCurrentSession((prev) => ({
      ...prev,
      title: prev.messages.length === 0 ? promptText.slice(0, 40) : prev.title,
      status: 'thinking',
      messages: [...prev.messages, userMessage, initialAgentMessage],
    }));

    setStatus('thinking');
    setActiveView('workspace');

    try {
      if (window.junscience?.agent) {
        // Execute via Electron IPC
        await window.junscience.agent.submitPrompt(promptText, currentSession.id);
      } else {
        // Browser fallback
        setTimeout(() => {
          setStatus('tool_calling');
          setCurrentSession((prev) => {
            const msgs = [...prev.messages];
            const last = msgs[msgs.length - 1];
            if (last && last.role === 'agent') {
              last.toolExecutions = mockDefaultTools;
              last.artifacts = mockDefaultArtifacts;
              last.citations = mockDefaultCitations;
            }
            return { ...prev, messages: msgs };
          });
        }, 1000);

        setTimeout(() => {
          setStatus('completed');
          setCurrentSession((prev) => {
            const msgs = [...prev.messages];
            const last = msgs[msgs.length - 1];
            if (last && last.role === 'agent') {
              last.status = 'completed';
              last.content = `### Scientific Research Synthesis\n\nAutomated analysis for "${promptText}" completed. Data tables, volcano plots, and literature citations are indexed below.`;
            }
            return { ...prev, status: 'completed', messages: msgs };
          });
        }, 2500);
      }
    } catch (err) {
      console.error('Agent execution error:', err);
      setStatus('idle');
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
  if (!context) throw new Error('useAgent must be used within AgentProvider');
  return context;
};
