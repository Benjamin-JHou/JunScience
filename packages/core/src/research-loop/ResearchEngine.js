import { AgentLoop } from '../core/AgentLoop';
import { globalSessionManager } from '../core/SessionManager';
import { globalEventBus } from '../core/EventBus';
import { GenericModelClient } from '../client/GenericModelClient';
import { fallbackMockProvider } from '../client/ScientificMockProvider';
import { globalProfileManager } from '../config/ProfileManager';
export class ResearchEngine {
    agentLoop;
    profileManager;
    sessionManager;
    eventBus;
    constructor(options) {
        this.profileManager = options?.profileManager || globalProfileManager;
        this.sessionManager = options?.sessionManager || globalSessionManager;
        this.eventBus = options?.eventBus || globalEventBus;
        const provider = this.resolveActiveProvider();
        this.agentLoop = new AgentLoop({
            modelProvider: provider,
            sessionManager: this.sessionManager,
            eventBus: this.eventBus,
        });
    }
    resolveActiveProvider() {
        const activeProfile = this.profileManager.getActiveProfile();
        if (activeProfile && activeProfile.baseUrl && activeProfile.model) {
            return new GenericModelClient(activeProfile);
        }
        return fallbackMockProvider;
    }
    updateProviderFromActiveProfile() {
        const provider = this.resolveActiveProvider();
        this.agentLoop.setModelProvider(provider);
    }
    getModelProvider() {
        return this.agentLoop.getModelProvider();
    }
    async executeInquiry(inquiry, sessionId, onDelta) {
        let session = sessionId ? this.sessionManager.getSession(sessionId) : undefined;
        if (!session) {
            const activeProfile = this.profileManager.getActiveProfile();
            session = this.sessionManager.createSession(inquiry.slice(0, 60), 'proj-1', 'research', activeProfile?.id);
        }
        // Refresh model provider before running
        this.updateProviderFromActiveProfile();
        const turn = await this.agentLoop.run(session, inquiry, onDelta);
        return { session, turn };
    }
}
export const globalResearchEngine = new ResearchEngine();
//# sourceMappingURL=ResearchEngine.js.map