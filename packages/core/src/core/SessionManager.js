import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { globalEventBus } from './EventBus';
export class SessionManager {
    sessions = new Map();
    activeSessionId = null;
    storageDir;
    eventBus;
    constructor(customDir, customEventBus) {
        this.storageDir = customDir || path.join(process.env.JUNSCIENCE_HOME || path.join(os.homedir(), '.junscience'), 'sessions');
        this.eventBus = customEventBus || globalEventBus;
        this.loadFromStorage();
    }
    ensureDirectory() {
        if (!fs.existsSync(this.storageDir)) {
            try {
                fs.mkdirSync(this.storageDir, { recursive: true, mode: 0o700 });
            }
            catch {
                // In-memory fallback if filesystem restricted
            }
        }
    }
    loadFromStorage() {
        if (!fs.existsSync(this.storageDir))
            return;
        try {
            const files = fs.readdirSync(this.storageDir).filter((f) => f.endsWith('.json'));
            for (const file of files) {
                try {
                    const raw = fs.readFileSync(path.join(this.storageDir, file), 'utf-8');
                    const session = JSON.parse(raw);
                    this.sessions.set(session.id, session);
                }
                catch {
                    // ignore corrupted file
                }
            }
            if (this.sessions.size > 0 && !this.activeSessionId) {
                const sorted = Array.from(this.sessions.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                this.activeSessionId = sorted[0].id;
            }
        }
        catch {
            // In-memory mode
        }
    }
    saveSessionToDisk(session) {
        try {
            this.ensureDirectory();
            const filePath = path.join(this.storageDir, `${session.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(session, null, 2), { mode: 0o600 });
        }
        catch {
            // ignore
        }
    }
    createSession(title, projectId = 'proj-1', agentId = 'research', profileId) {
        const id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const now = new Date().toISOString();
        const session = {
            id,
            projectId,
            title,
            createdAt: now,
            updatedAt: now,
            activeAgent: agentId,
            activeProfileId: profileId,
            activeModel: 'User-Configured Model',
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
    getSession(id) {
        return this.sessions.get(id);
    }
    getActiveSession() {
        if (!this.activeSessionId)
            return undefined;
        return this.sessions.get(this.activeSessionId);
    }
    setActiveSession(id) {
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
    listSessions() {
        return Array.from(this.sessions.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    updateSessionStatus(id, status) {
        const session = this.sessions.get(id);
        if (session) {
            session.status = status;
            session.updatedAt = new Date().toISOString();
            this.saveSessionToDisk(session);
        }
    }
    addTurn(id, turn) {
        const session = this.sessions.get(id);
        if (session) {
            session.turns.push(turn);
            session.updatedAt = new Date().toISOString();
            this.saveSessionToDisk(session);
        }
    }
    addArtifact(id, artifact) {
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
    addCitation(id, citation) {
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
}
export const globalSessionManager = new SessionManager();
//# sourceMappingURL=SessionManager.js.map