import { RuntimeSession, Turn, AgentId } from '../types/runtime';
import { Artifact, Citation, AgentStatus } from '../../types/agent';
import { globalEventBus } from './EventBus';
import { mockDefaultSession } from '../../data/mockResearch';

export class SessionManager {
  private sessions: Map<string, RuntimeSession> = new Map();
  private activeSessionId: string | null = null;
  private storageKey = 'junscience_runtime_sessions';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
          const parsed = JSON.parse(data) as RuntimeSession[];
          parsed.forEach((s) => this.sessions.set(s.id, s));
        }
      }
    } catch (e) {
      console.warn('[SessionManager] Could not load from localStorage, initializing in-memory.');
    }

    // Seed default session if empty
    if (this.sessions.size === 0) {
      const defaultRuntimeSession: RuntimeSession = {
        id: mockDefaultSession.id,
        projectId: 'proj-1',
        title: mockDefaultSession.title,
        createdAt: mockDefaultSession.createdAt,
        updatedAt: mockDefaultSession.updatedAt,
        activeAgent: 'research',
        activeModel: 'JunScience-Research-v1',
        status: mockDefaultSession.status,
        turns: [
          {
            index: 0,
            userInput: mockDefaultSession.messages[0].content,
            agentResponse: mockDefaultSession.messages[1].content,
            toolCalls: [],
            toolResults: [],
            status: 'completed',
            startedAt: mockDefaultSession.createdAt,
            completedAt: mockDefaultSession.updatedAt,
          },
        ],
        artifacts: mockDefaultSession.messages[1].artifacts || [],
        citations: mockDefaultSession.messages[1].citations || [],
        metadata: {},
      };
      this.sessions.set(defaultRuntimeSession.id, defaultRuntimeSession);
      this.activeSessionId = defaultRuntimeSession.id;
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const list = Array.from(this.sessions.values());
        localStorage.setItem(this.storageKey, JSON.stringify(list));
      }
    } catch (e) {
      console.warn('[SessionManager] Could not save to localStorage.');
    }
  }

  public createSession(
    title: string,
    projectId: string = 'proj-1',
    agentId: AgentId = 'research'
  ): RuntimeSession {
    const id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const session: RuntimeSession = {
      id,
      projectId,
      title,
      createdAt: now,
      updatedAt: now,
      activeAgent: agentId,
      activeModel: 'JunScience-Research-v1',
      status: 'idle',
      turns: [],
      artifacts: [],
      citations: [],
      metadata: {},
    };

    this.sessions.set(id, session);
    this.activeSessionId = id;
    this.saveToStorage();

    globalEventBus.emit({
      type: 'session.created',
      sessionId: id,
      timestamp: now,
      payload: { sessionId: id, title, agentId },
    });

    return session;
  }

  public getSession(id: string): RuntimeSession | undefined {
    return this.sessions.get(id);
  }

  public getActiveSession(): RuntimeSession | undefined {
    if (!this.activeSessionId) return undefined;
    return this.sessions.get(this.activeSessionId);
  }

  public setActiveSession(id: string): void {
    if (this.sessions.has(id)) {
      this.activeSessionId = id;
      globalEventBus.emit({
        type: 'session.resumed',
        sessionId: id,
        timestamp: new Date().toISOString(),
        payload: { sessionId: id },
      });
    }
  }

  public listSessions(): RuntimeSession[] {
    return Array.from(this.sessions.values());
  }

  public updateSessionStatus(id: string, status: AgentStatus): void {
    const session = this.sessions.get(id);
    if (session) {
      session.status = status;
      session.updatedAt = new Date().toISOString();
      this.saveToStorage();
    }
  }

  public addTurn(id: string, turn: Turn): void {
    const session = this.sessions.get(id);
    if (session) {
      session.turns.push(turn);
      session.updatedAt = new Date().toISOString();
      this.saveToStorage();
    }
  }

  public addArtifact(id: string, artifact: Artifact): void {
    const session = this.sessions.get(id);
    if (session) {
      session.artifacts.push(artifact);
      session.updatedAt = new Date().toISOString();
      this.saveToStorage();

      globalEventBus.emit({
        type: 'artifact.created',
        sessionId: id,
        timestamp: new Date().toISOString(),
        payload: { artifact },
      });
    }
  }

  public addCitation(id: string, citation: Citation): void {
    const session = this.sessions.get(id);
    if (session) {
      session.citations.push(citation);
      session.updatedAt = new Date().toISOString();
      this.saveToStorage();

      globalEventBus.emit({
        type: 'citation.created',
        sessionId: id,
        timestamp: new Date().toISOString(),
        payload: { citation },
      });
    }
  }
}

export const globalSessionManager = new SessionManager();
