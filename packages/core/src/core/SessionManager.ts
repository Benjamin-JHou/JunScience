import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { RuntimeSession, Turn, AgentId, Artifact, Citation, AgentStatus } from '../types/runtime.js';
import { globalEventBus, EventBus } from './EventBus.js';

export class SessionManager {
  private sessions: Map<string, RuntimeSession> = new Map();
  private activeSessionId: string | null = null;
  private storageDir: string;
  private eventBus: EventBus;

  constructor(customDir?: string, customEventBus?: EventBus) {
    this.storageDir = customDir || path.join(process.env.JUNSCIENCE_HOME || path.join(os.homedir(), '.junscience'), 'sessions');
    this.eventBus = customEventBus || globalEventBus;
    this.loadFromStorage();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(this.storageDir)) {
      try {
        fs.mkdirSync(this.storageDir, { recursive: true, mode: 0o700 });
      } catch {
        // In-memory fallback if filesystem restricted
      }
    }
  }

  private loadFromStorage(): void {
    if (!fs.existsSync(this.storageDir)) return;
    try {
      const files = fs.readdirSync(this.storageDir).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(this.storageDir, file), 'utf-8');
          const session = JSON.parse(raw) as RuntimeSession;
          this.sessions.set(session.id, session);
        } catch {
          // ignore corrupted file
        }
      }
      if (this.sessions.size > 0 && !this.activeSessionId) {
        const sorted = Array.from(this.sessions.values()).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        this.activeSessionId = sorted[0].id;
      }
    } catch {
      // In-memory mode
    }
  }

  private saveSessionToDisk(session: RuntimeSession): void {
    try {
      this.ensureDirectory();
      const filePath = path.join(this.storageDir, `${session.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2), { mode: 0o600 });
    } catch {
      // ignore
    }
  }

  public createSession(
    title: string,
    projectId: string = 'proj-1',
    agentId: AgentId = 'research',
    profileId?: string,
    modelName?: string
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
      activeProfileId: profileId,
      activeModel: modelName || 'default-model',
      status: 'idle',
      turns: [],
      artifacts: [],
      citations: [],
      metadata: {},
    };

    this.sessions.set(id, session);
    this.activeSessionId = id;
    this.saveSessionToDisk(session);

    this.eventBus.emit({
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
      this.eventBus.emit({
        type: 'session.resumed',
        sessionId: id,
        timestamp: new Date().toISOString(),
        payload: { sessionId: id },
      });
    }
  }

  public listSessions(): RuntimeSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public updateSessionStatus(id: string, status: AgentStatus): void {
    const session = this.sessions.get(id);
    if (session) {
      session.status = status;
      session.updatedAt = new Date().toISOString();
      this.saveSessionToDisk(session);
    }
  }

  public addTurn(id: string, turn: Turn): void {
    const session = this.sessions.get(id);
    if (session) {
      session.turns.push(turn);
      session.updatedAt = new Date().toISOString();
      this.saveSessionToDisk(session);
    }
  }

  public addArtifact(id: string, artifact: Artifact): void {
    const session = this.sessions.get(id);
    if (session) {
      session.artifacts.push(artifact);
      session.updatedAt = new Date().toISOString();
      this.saveSessionToDisk(session);

      this.eventBus.emit({
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
      this.saveSessionToDisk(session);

      this.eventBus.emit({
        type: 'citation.created',
        sessionId: id,
        timestamp: new Date().toISOString(),
        payload: { citation },
      });
    }
  }

  public deleteSession(id: string): boolean {
    const exists = this.sessions.has(id);
    if (!exists) return false;

    this.sessions.delete(id);
    this.steeringQueues.delete(id);

    if (this.activeSessionId === id) {
      const remaining = this.listSessions();
      this.activeSessionId = remaining.length > 0 ? remaining[0].id : null;
    }

    try {
      const filePath = path.join(this.storageDir, `${id}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // ignore
    }

    this.eventBus.emit({
      type: 'session.deleted',
      sessionId: id,
      timestamp: new Date().toISOString(),
      payload: { sessionId: id },
    });

    return true;
  }

  public renameSession(id: string, newTitle: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;

    session.title = newTitle.trim() || 'Untitled Research Session';
    session.updatedAt = new Date().toISOString();
    this.saveSessionToDisk(session);

    this.eventBus.emit({
      type: 'session.renamed',
      sessionId: id,
      timestamp: session.updatedAt,
      payload: { sessionId: id, title: session.title },
    });

    return true;
  }

  public exportSessionMarkdown(id: string): string {
    const session = this.sessions.get(id);
    if (!session) return '# Session Not Found\n';

    const lines: string[] = [];
    lines.push(`# JunScience Research Report: ${session.title}`);
    lines.push(`\n**Session ID**: \`${session.id}\`  `);
    lines.push(`**Date**: ${new Date(session.createdAt).toLocaleString()}  `);
    lines.push(`**Model**: \`${session.activeModel || 'Default Model'}\`  `);
    lines.push(`**Status**: \`${session.status.toUpperCase()}\`\n`);
    lines.push(`---\n`);

    lines.push(`## 1. Research Investigation Stream\n`);
    if (session.turns && session.turns.length > 0) {
      session.turns.forEach((turn, idx) => {
        lines.push(`### Turn ${idx + 1}`);
        lines.push(`**User Inquiry**: ${turn.userInput}\n`);
        lines.push(`**Scientific Synthesis**:\n${turn.agentResponse}\n`);

        if (turn.toolResults && turn.toolResults.length > 0) {
          lines.push(`#### Tool Invocations:`);
          turn.toolResults.forEach((tr) => {
            const exec = tr.execution;
            lines.push(`- **\`${tr.name}\`** (${exec?.status || 'completed'}, ${exec?.duration || 'N/A'}): ${exec?.resultSummary || exec?.description || 'Executed'}`);
          });
          lines.push('');
        }
      });
    } else {
      lines.push(`*No conversation turns recorded in this session.*\n`);
    }

    if (session.artifacts && session.artifacts.length > 0) {
      lines.push(`\n## 2. Generated Research Artifacts\n`);
      session.artifacts.forEach((art) => {
        lines.push(`- **${art.title}** (\`${art.type}\`): ${art.description}`);
      });
    }

    if (session.citations && session.citations.length > 0) {
      lines.push(`\n## 3. Verified Evidence Anchors & Literature Citations\n`);
      session.citations.forEach((cit, idx) => {
        lines.push(`[${idx + 1}] **${cit.title}** (${cit.journal || 'Journal'}, ${cit.year || 'Year'})`);
        if (cit.pmid) lines.push(`    PMID: [${cit.pmid}](https://pubmed.ncbi.nlm.nih.gov/${cit.pmid}/)`);
        if (cit.doi) lines.push(`    DOI: [${cit.doi}](https://doi.org/${cit.doi})`);
        if (cit.abstractSnippet) lines.push(`    *${cit.abstractSnippet}*`);
      });
    }

    lines.push(`\n---\n*Generated by JunScience Autonomous Research Workstation*`);
    return lines.join('\n');
  }

  // Mid-run steering support
  private steeringQueues: Map<string, string[]> = new Map();

  public queueSteering(sessionId: string, guidance: string): void {
    const queue = this.steeringQueues.get(sessionId) || [];
    queue.push(guidance);
    this.steeringQueues.set(sessionId, queue);
    this.eventBus.emit({
      type: 'agent.thinking',
      sessionId,
      timestamp: new Date().toISOString(),
      payload: {
        thought: `[User Steering Queued] "${guidance}" will take effect at next loop step.`,
        phase: 'User Steering',
      },
    });
  }

  public popSteering(sessionId: string): string | undefined {
    const queue = this.steeringQueues.get(sessionId);
    if (!queue || queue.length === 0) return undefined;
    return queue.shift();
  }

  public getPendingSteering(sessionId: string): string[] {
    return this.steeringQueues.get(sessionId) || [];
  }
}

export const globalSessionManager = new SessionManager();
