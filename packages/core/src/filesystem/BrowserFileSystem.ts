import { IFileSystem } from "./IFileSystem";

export class BrowserFileSystem implements IFileSystem {
  private storage = new Map<string, Uint8Array>();

  async readText(path: string): Promise<string> {
    const data = this.storage.get(path);
    if (!data) throw new Error(`File not found: ${path}`);
    return new TextDecoder().decode(data);
  }

  async writeText(path: string, content: string): Promise<void> {
    this.storage.set(path, new TextEncoder().encode(content));
    this.persistToLocalStorage();
  }

  async readBinary(path: string): Promise<Uint8Array> {
    const data = this.storage.get(path);
    if (!data) throw new Error(`File not found: ${path}`);
    return data;
  }

  async writeBinary(path: string, data: Uint8Array): Promise<void> {
    this.storage.set(path, data);
    this.persistToLocalStorage();
  }

  async exists(path: string): Promise<boolean> {
    return this.storage.has(path);
  }

  async mkdir(_path: string): Promise<void> {}

  async remove(path: string): Promise<void> {
    this.storage.delete(path);
    this.persistToLocalStorage();
  }

  async listDir(path: string): Promise<string[]> {
    const prefix = path.endsWith("/") ? path : path + "/";
    const entries = new Set<string>();
    for (const key of this.storage.keys()) {
      if (key.startsWith(prefix)) {
        const rest = key.slice(prefix.length);
        const firstSegment = rest.split("/")[0];
        entries.add(firstSegment);
      }
    }
    return [...entries];
  }

  async isFile(path: string): Promise<boolean> {
    return this.storage.has(path);
  }

  async isDir(path: string): Promise<boolean> {
    const prefix = path.endsWith("/") ? path : path + "/";
    for (const key of this.storage.keys()) {
      if (key.startsWith(prefix)) return true;
    }
    return false;
  }

  private persistToLocalStorage(): void {
    try {
      const obj: Record<string, number[]> = {};
      for (const [k, v] of this.storage) {
        obj[k] = [...v];
      }
      localStorage.setItem("photon:fs", JSON.stringify(obj));
    } catch { /* quota exceeded, ignore */ }
  }

  loadFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem("photon:fs");
      if (!raw) return;
      const obj = JSON.parse(raw) as Record<string, number[]>;
      for (const [k, v] of Object.entries(obj)) {
        this.storage.set(k, new Uint8Array(v));
      }
    } catch { /* corrupted, ignore */ }
  }
}
