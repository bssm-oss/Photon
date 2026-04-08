type Listener<T = unknown> = (data: T) => void;

export class EventBus {
  private listeners = new Map<string, Set<Listener>>();

  on<T = unknown>(event: string, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(listener as Listener);
    return () => this.off(event, listener);
  }

  once<T = unknown>(event: string, listener: Listener<T>): () => void {
    const wrapped: Listener<T> = (data) => {
      this.off(event, wrapped);
      listener(data);
    };
    return this.on(event, wrapped);
  }

  off<T = unknown>(event: string, listener: Listener<T>): void {
    this.listeners.get(event)?.delete(listener as Listener);
  }

  emit<T = unknown>(event: string, data: T): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const fn of set) {
      try { fn(data); } catch (e) { console.error(`[EventBus] Error in "${event}":`, e); }
    }
  }

  clear(event?: string): void {
    if (event) { this.listeners.delete(event); }
    else { this.listeners.clear(); }
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export const globalBus = new EventBus();
