export enum InputPriority {
  Game = 0,
  UI = 100,
  Console = 200,
  Modal = 300,
}

interface CaptureEntry {
  holderId: string;
  priority: InputPriority;
  timestamp: number;
}

export class InputCaptureStack {
  private stack: CaptureEntry[] = [];
  private counter = 0;

  request(holderId: string, priority: InputPriority): boolean {
    const existing = this.stack.findIndex((e) => e.holderId === holderId);
    if (existing !== -1) {
      this.stack.splice(existing, 1);
    }

    const entry: CaptureEntry = {
      holderId,
      priority,
      timestamp: this.counter++,
    };

    const insertIdx = this.stack.findIndex(
      (e) => e.priority < priority || (e.priority === priority && false),
    );

    this.stack.push(entry);
    this.stack.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.timestamp - a.timestamp;
    });

    return this.stack[0].holderId === holderId;
  }

  release(holderId: string): void {
    const idx = this.stack.findIndex((e) => e.holderId === holderId);
    if (idx !== -1) this.stack.splice(idx, 1);
  }

  isCaptured(): boolean {
    return this.stack.length > 0;
  }

  getCurrentHolder(): string | null {
    return this.stack.length > 0 ? this.stack[0].holderId : null;
  }

  hasOwnership(holderId: string): boolean {
    return this.stack.length > 0 && this.stack[0].holderId === holderId;
  }

  getStack(): readonly CaptureEntry[] {
    return this.stack;
  }

  clear(): void {
    this.stack = [];
    this.counter = 0;
  }
}