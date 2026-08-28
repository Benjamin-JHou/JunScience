import { RuntimeSession, Turn, AgentId, Artifact, Citation, AgentStatus } from '../types/runtime';
import { EventBus } from './EventBus';
export declare class SessionManager {
    private sessions;
    private activeSessionId;
    private storageDir;
    private eventBus;
    constructor(customDir?: string, customEventBus?: EventBus);
    private ensureDirectory;
    private loadFromStorage;
    private saveSessionToDisk;
    createSession(title: string, projectId?: string, agentId?: AgentId, profileId?: string): RuntimeSession;
    getSession(id: string): RuntimeSession | undefined;
    getActiveSession(): RuntimeSession | undefined;
    setActiveSession(id: string): void;
    listSessions(): RuntimeSession[];
    updateSessionStatus(id: string, status: AgentStatus): void;
    addTurn(id: string, turn: Turn): void;
    addArtifact(id: string, artifact: Artifact): void;
    addCitation(id: string, citation: Citation): void;
}
export declare const globalSessionManager: SessionManager;
//# sourceMappingURL=SessionManager.d.ts.map