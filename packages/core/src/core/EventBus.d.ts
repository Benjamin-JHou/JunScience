import { RuntimeEvent, EventType } from '../types/events';
export declare class EventBus {
    private listeners;
    private allListeners;
    private history;
    private maxHistory;
    constructor(maxHistory?: number);
    on<T extends EventType>(type: T, handler: (event: Extract<RuntimeEvent, {
        type: T;
    }>) => void): () => void;
    onAll(handler: (event: RuntimeEvent) => void): () => void;
    emit(event: RuntimeEvent): void;
    getHistory(sessionId?: string): RuntimeEvent[];
    clear(): void;
}
export declare const globalEventBus: EventBus;
//# sourceMappingURL=EventBus.d.ts.map