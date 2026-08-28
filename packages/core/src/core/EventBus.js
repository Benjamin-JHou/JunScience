export class EventBus {
    listeners = new Map();
    allListeners = new Set();
    history = [];
    maxHistory;
    constructor(maxHistory = 1000) {
        this.maxHistory = maxHistory;
    }
    on(type, handler) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        const handlers = this.listeners.get(type);
        handlers.add(handler);
        return () => {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.listeners.delete(type);
            }
        };
    }
    onAll(handler) {
        this.allListeners.add(handler);
        return () => {
            this.allListeners.delete(handler);
        };
    }
    emit(event) {
        this.history.push(event);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        const specificHandlers = this.listeners.get(event.type);
        if (specificHandlers) {
            specificHandlers.forEach((handler) => {
                try {
                    handler(event);
                }
                catch (err) {
                    console.error(`[EventBus] Error in handler for ${event.type}:`, err);
                }
            });
        }
        this.allListeners.forEach((handler) => {
            try {
                handler(event);
            }
            catch (err) {
                console.error(`[EventBus] Error in wildcard handler for ${event.type}:`, err);
            }
        });
    }
    getHistory(sessionId) {
        if (!sessionId)
            return [...this.history];
        return this.history.filter((e) => e.sessionId === sessionId);
    }
    clear() {
        this.history = [];
        this.listeners.clear();
        this.allListeners.clear();
    }
}
export const globalEventBus = new EventBus();
//# sourceMappingURL=EventBus.js.map