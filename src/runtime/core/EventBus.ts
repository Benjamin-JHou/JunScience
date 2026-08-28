import { RuntimeEvent, EventType } from '../types/events';

type EventHandler<E extends RuntimeEvent = RuntimeEvent> = (event: E) => void;

export class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private allListeners: Set<EventHandler> = new Set();
  private history: RuntimeEvent[] = [];
  private maxHistory: number = 1000;

  constructor(maxHistory: number = 1000) {
    this.maxHistory = maxHistory;
  }

  public on<T extends EventType>(
    type: T,
    handler: (event: Extract<RuntimeEvent, { type: T }>) => void
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    const handlers = this.listeners.get(type)!;
    handlers.add(handler as EventHandler);

    return () => {
      handlers.delete(handler as EventHandler);
      if (handlers.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  public onAll(handler: (event: RuntimeEvent) => void): () => void {
    this.allListeners.add(handler);
    return () => {
      this.allListeners.delete(handler);
    };
  }

  public emit(event: RuntimeEvent): void {
    // Record to history
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Notify specific type listeners
    const specificHandlers = this.listeners.get(event.type);
    if (specificHandlers) {
      specificHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (err) {
          console.error(`[EventBus] Error in handler for ${event.type}:`, err);
        }
      });
    }

    // Notify global listeners
    this.allListeners.forEach((handler) => {
      try {
        handler(event);
      } catch (err) {
        console.error(`[EventBus] Error in wildcard handler for ${event.type}:`, err);
      }
    });
  }

  public getHistory(sessionId?: string): RuntimeEvent[] {
    if (!sessionId) return [...this.history];
    return this.history.filter((e) => e.sessionId === sessionId);
  }

  public clear(): void {
    this.history = [];
    this.listeners.clear();
    this.allListeners.clear();
  }
}

export const globalEventBus = new EventBus();
