import { AutonomousResearchEngine } from './AutonomousResearchEngine.js';
import { SessionManager, globalSessionManager } from '../core/SessionManager.js';
import { EventBus, globalEventBus } from '../core/EventBus.js';
import { ModelProvider } from '../client/ModelProvider.js';
import { GenericModelClient } from '../client/GenericModelClient.js';
import { fallbackMockProvider } from '../client/ScientificMockProvider.js';
import { ProfileManager, globalProfileManager } from '../config/ProfileManager.js';
import { RuntimeSession, Turn } from '../types/runtime.js';

export interface ResearchEngineOptions {
  profileManager?: ProfileManager;
  sessionManager?: SessionManager;
  eventBus?: EventBus;
}

export class ResearchEngine {
  private autonomousEngine: AutonomousResearchEngine;
  private profileManager: ProfileManager;
  private sessionManager: SessionManager;
  private eventBus: EventBus;

  constructor(options?: ResearchEngineOptions) {
    this.profileManager = options?.profileManager || globalProfileManager;
    this.sessionManager = options?.sessionManager || globalSessionManager;
    this.eventBus = options?.eventBus || globalEventBus;

    const provider = this.resolveActiveProvider();
    this.autonomousEngine = new AutonomousResearchEngine({
      modelProvider: provider,
      sessionManager: this.sessionManager,
      eventBus: this.eventBus,
      maxTurns: 8,
    });
  }

  public resolveActiveProvider(): ModelProvider {
    const activeProfile = this.profileManager.getActiveProfile();
    if (activeProfile && activeProfile.baseUrl && activeProfile.model) {
      return new GenericModelClient(activeProfile);
    }
    return fallbackMockProvider;
  }

  public updateProviderFromActiveProfile(): void {
    const provider = this.resolveActiveProvider();
    this.autonomousEngine.setModelProvider(provider);
  }

  public getModelProvider(): ModelProvider {
    return this.autonomousEngine.getModelProvider();
  }

  public async executeInquiry(
    inquiry: string,
    sessionId?: string,
    onDelta?: (chunk: string) => void
  ): Promise<{ session: RuntimeSession; turn: Turn }> {
    let session = sessionId ? this.sessionManager.getSession(sessionId) : undefined;
    if (!session) {
      const activeProfile = this.profileManager.getActiveProfile();
      session = this.sessionManager.createSession(
        inquiry.slice(0, 60),
        'proj-1',
        'research',
        activeProfile?.id,
        activeProfile?.model
      );
    } else {
      const activeProfile = this.profileManager.getActiveProfile();
      if (activeProfile?.model) {
        session.activeModel = activeProfile.model;
      }
    }

    // Refresh model provider before running
    this.updateProviderFromActiveProfile();

    const turn = await this.autonomousEngine.run(session, inquiry, onDelta);
    return { session, turn };
  }
}

export const globalResearchEngine = new ResearchEngine();
