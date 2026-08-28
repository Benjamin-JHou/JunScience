import { SessionManager } from '../core/SessionManager';
import { EventBus } from '../core/EventBus';
import { ModelProvider } from '../client/ModelProvider';
import { ProfileManager } from '../config/ProfileManager';
import { RuntimeSession, Turn } from '../types/runtime';
export interface ResearchEngineOptions {
    profileManager?: ProfileManager;
    sessionManager?: SessionManager;
    eventBus?: EventBus;
}
export declare class ResearchEngine {
    private agentLoop;
    private profileManager;
    private sessionManager;
    private eventBus;
    constructor(options?: ResearchEngineOptions);
    resolveActiveProvider(): ModelProvider;
    updateProviderFromActiveProfile(): void;
    getModelProvider(): ModelProvider;
    executeInquiry(inquiry: string, sessionId?: string, onDelta?: (chunk: string) => void): Promise<{
        session: RuntimeSession;
        turn: Turn;
    }>;
}
export declare const globalResearchEngine: ResearchEngine;
//# sourceMappingURL=ResearchEngine.d.ts.map