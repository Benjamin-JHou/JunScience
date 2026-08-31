import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgentSession, AgentStatus, AgentMessage, ToolExecution, Artifact, Citation } from '../types/agent';
import type { RuntimeEvent } from '@junscience/core';

interface AgentContextType {
  sessions: AgentSession[];
  currentSession: AgentSession;
  activeView: 'home' | 'workspace';
  status: AgentStatus;
  submitPrompt: (promptText: string) => Promise<void>;
  resetSession: () => void;
  openSession: (sessionId: string) => void;
  renameSession: (sessionId: string, newTitle: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  exportSession: (sessionId: string) => Promise<string>;
  setActiveView: (view: 'home' | 'workspace') => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

function createFreshSession(): AgentSession {
  const id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  return {
    id,
    title: 'New Scientific Exploration',
    createdAt: now,
    updatedAt: now,
    status: 'idle',
    messages: [],
  };
}

const LOCAL_STORAGE_SESSIONS_KEY = 'junscience_desktop_sessions_v1';

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<AgentSession[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [currentSession, setCurrentSession] = useState<AgentSession>(() => {
    return createFreshSession();
  });

  const [activeView, setActiveView] = useState<'home' | 'workspace'>('home');
  const [status, setStatus] = useState<AgentStatus>('idle');

  // Save sessions to localStorage whenever sessions list changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Load real sessions from Electron IPC on mount if available
  useEffect(() => {
    if (window.junscience?.session) {
      window.junscience.session.list().then((list) => {
        if (list && list.length > 0) {
          // Convert RuntimeSession to AgentSession format if needed
          const converted: AgentSession[] = list.map((rs) => ({
            id: rs.id,
            title: rs.title,
            createdAt: rs.createdAt,
            updatedAt: rs.updatedAt,
            status: rs.status as AgentStatus,
            messages: rs.turns?.flatMap((t, idx) => [
              {
                id: `msg-${rs.id}-${idx}-user`,
                role: 'user' as const,
                content: t.userInput,
                timestamp: new Date(t.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
              {
                id: `msg-${rs.id}-${idx}-agent`,
                role: 'agent' as const,
                status: t.status as AgentStatus,
                content: t.agentResponse,
                timestamp: new Date(t.completedAt || t.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                toolExecutions: t.toolResults?.map((tr) => tr.execution as any) || [],
                artifacts: rs.artifacts as any[] || [],
                citations: rs.citations as any[] || [],
              },
            ]) || [],
          }));
          setSessions(converted);
        }
      }).catch(() => {});
    }
  }, []);

  // Listen to IPC runtime events from Electron Main process
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
        setCurrentSession((prev) => {
          const messages = [...prev.messages];
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.role === 'agent') {
            const existingTools = lastMsg.toolExecutions || [];
            const exec = event.payload.execution;
            const updatedTools: ToolExecution[] = [
              ...existingTools.filter((t) => t.id !== exec.id && t.toolName !== exec.toolName),
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
            const art = event.payload.artifact as Artifact;
            lastMsg.artifacts = [...(lastMsg.artifacts || []).filter((a) => a.id !== art.id), art];
          }
          return { ...prev, messages };
        });
        break;
      case 'citation.created':
        setCurrentSession((prev) => {
          const messages = [...prev.messages];
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.role === 'agent') {
            const cit = event.payload.citation as Citation;
            lastMsg.citations = [...(lastMsg.citations || []).filter((c) => c.id !== cit.id), cit];
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
          const updated = { ...prev, status: 'completed' as AgentStatus, updatedAt: new Date().toISOString(), messages };
          // Upsert into sessions list
          setSessions((prevList) => {
            const exists = prevList.some((s) => s.id === updated.id);
            if (exists) {
              return prevList.map((s) => (s.id === updated.id ? updated : s));
            }
            return [updated, ...prevList];
          });
          return updated;
        });
        break;
    }
  };

  const resetSession = () => {
    const fresh = createFreshSession();
    setCurrentSession(fresh);
    setStatus('idle');
    setActiveView('home');
  };

  const openSession = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      setCurrentSession(target);
      setStatus(target.status);
      setActiveView('workspace');
    }
  };

  const renameSession = async (sessionId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    if (window.junscience?.session) {
      await window.junscience.session.rename(sessionId, trimmed);
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: trimmed, updatedAt: new Date().toISOString() } : s))
    );

    setCurrentSession((prev) => (prev.id === sessionId ? { ...prev, title: trimmed } : prev));
  };

  const deleteSession = async (sessionId: string) => {
    if (window.junscience?.session) {
      await window.junscience.session.delete(sessionId);
    }

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));

    if (currentSession.id === sessionId) {
      resetSession();
    }
  };

  const exportSession = async (sessionId: string): Promise<string> => {
    if (window.junscience?.session) {
      try {
        const exported = await window.junscience.session.export(sessionId);
        if (exported) return exported;
      } catch {}
    }

    const sess = sessions.find((s) => s.id === sessionId) || (currentSession.id === sessionId ? currentSession : null);
    if (!sess) return '# Session Not Found\n';

    const lines: string[] = [
      `# JunScience Research Report: ${sess.title}`,
      `\n**Session ID**: \`${sess.id}\`  `,
      `**Created At**: ${new Date(sess.createdAt).toLocaleString()}  `,
      `**Status**: \`${sess.status.toUpperCase()}\`\n`,
      `---\n`,
      `## Research Dialogue & Investigation Stream\n`,
    ];

    sess.messages.forEach((msg, idx) => {
      const isAgent = msg.role === 'agent';
      lines.push(`### ${isAgent ? '🔬 JunScience Agent' : '👤 User Inquiry'} (${msg.timestamp})`);
      lines.push(`${msg.content}\n`);

      if (msg.toolExecutions && msg.toolExecutions.length > 0) {
        lines.push(`**Executed Scientific Tools:**`);
        msg.toolExecutions.forEach((t) => {
          lines.push(`- **\`${t.toolName}\`** (${t.status}, ${t.duration || 'N/A'}): ${t.resultSummary || t.description}`);
        });
        lines.push('');
      }

      if (msg.artifacts && msg.artifacts.length > 0) {
        lines.push(`**Generated Research Artifacts:**`);
        msg.artifacts.forEach((art) => {
          lines.push(`- **${art.title}** (\`${art.type}\`): ${art.description}`);
        });
        lines.push('');
      }

      if (msg.citations && msg.citations.length > 0) {
        lines.push(`**Verified Evidence & Citations:**`);
        msg.citations.forEach((cit, cIdx) => {
          lines.push(`[${cIdx + 1}] **${cit.title}** (${cit.journal || 'Journal'}, ${cit.year || 'Year'})`);
          if (cit.pmid) lines.push(`    PMID: [${cit.pmid}](https://pubmed.ncbi.nlm.nih.gov/${cit.pmid}/)`);
          if (cit.doi) lines.push(`    DOI: [${cit.doi}](https://doi.org/${cit.doi})`);
        });
        lines.push('');
      }
    });

    lines.push(`\n---\n*Generated by JunScience Autonomous Research Workstation*`);
    return lines.join('\n');
  };

  const submitPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const trimmed = promptText.trim();
    const isFirstInquiry = currentSession.messages.length === 0;
    const sessionTitle = isFirstInquiry ? trimmed.slice(0, 50) : currentSession.title;

    const userMessage: AgentMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: trimmed,
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

    const activeSession: AgentSession = {
      ...currentSession,
      title: sessionTitle,
      status: 'thinking',
      updatedAt: new Date().toISOString(),
      messages: [...currentSession.messages, userMessage, initialAgentMessage],
    };

    setCurrentSession(activeSession);
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === activeSession.id);
      if (exists) {
        return prev.map((s) => (s.id === activeSession.id ? activeSession : s));
      }
      return [activeSession, ...prev];
    });

    setStatus('thinking');
    setActiveView('workspace');

    try {
      if (window.junscience?.agent) {
        await window.junscience.agent.submitPrompt(trimmed, currentSession.id);
      } else {
        // Fallback for browser preview
        setTimeout(() => {
          setStatus('tool_calling');
        }, 800);

        setTimeout(() => {
          setStatus('completed');
          setCurrentSession((prev) => {
            const msgs = [...prev.messages];
            const last = msgs[msgs.length - 1];
            if (last && last.role === 'agent') {
              last.status = 'completed';
              last.content = `### Scientific Research Synthesis: ${trimmed}\n\nAutomated scientific reasoning, evidence verification, and cross-database validation completed. Verified findings and research artifacts have been indexed into the Evidence Registry.`;
            }
            const completed = { ...prev, status: 'completed' as AgentStatus, updatedAt: new Date().toISOString(), messages: msgs };
            setSessions((prevList) => prevList.map((s) => (s.id === completed.id ? completed : s)));
            return completed;
          });
        }, 2000);
      }
    } catch (err) {
      console.error('Agent execution error:', err);
      setStatus('idle');
    }
  };

  return (
    <AgentContext.Provider
      value={{
        sessions,
        currentSession,
        activeView,
        status,
        submitPrompt,
        resetSession,
        openSession,
        renameSession,
        deleteSession,
        exportSession,
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
