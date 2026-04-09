import { IFileSystem } from "photon-engine";

export class OPFSFileSystem implements IFileSystem {
  private async getRoot(): Promise<FileSystemDirectoryHandle> {
    return navigator.storage.getDirectory();
  }

  private async resolveFile(path: string, create = false): Promise<FileSystemFileHandle> {
    const parts = path.split("/").filter(Boolean);
    let dir = await this.getRoot();
    for (let i = 0; i < parts.length - 1; i++) {
      dir = await dir.getDirectoryHandle(parts[i], { create });
    }
    return dir.getFileHandle(parts[parts.length - 1], { create });
  }

  private async resolveDir(path: string, create = false): Promise<FileSystemDirectoryHandle> {
    const parts = path.split("/").filter(Boolean);
    let dir = await this.getRoot();
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create });
    }
    return dir;
  }

  async readText(path: string): Promise<string> {
    const file = await (await this.resolveFile(path)).getFile();
    return file.text();
  }

  async writeText(path: string, content: string): Promise<void> {
    const handle = await this.resolveFile(path, true);
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async readBinary(path: string): Promise<Uint8Array> {
    const file = await (await this.resolveFile(path)).getFile();
    return new Uint8Array(await file.arrayBuffer());
  }

  async writeBinary(path: string, data: Uint8Array): Promise<void> {
    const handle = await this.resolveFile(path, true);
    const writable = await handle.createWritable();
    await writable.write(data.buffer as ArrayBuffer);
    await writable.close();
  }

  async exists(path: string): Promise<boolean> {
    try { await this.resolveFile(path); return true; } catch {}
    try { await this.resolveDir(path); return true; } catch {}
    return false;
  }

  async mkdir(path: string): Promise<void> {
    await this.resolveDir(path, true);
  }

  async remove(path: string): Promise<void> {
    const parts = path.split("/").filter(Boolean);
    const name = parts[parts.length - 1];
    const parent = await this.resolveDir(parts.slice(0, -1).join("/"));
    await parent.removeEntry(name, { recursive: true });
  }

  async listDir(path: string): Promise<string[]> {
    const dir = await this.resolveDir(path);
    const entries: string[] = [];
    for await (const [name] of dir as unknown as AsyncIterable<[string, FileSystemHandle]>) {
      entries.push(name);
    }
    return entries;
  }

  async isFile(path: string): Promise<boolean> {
    try { await this.resolveFile(path); return true; } catch { return false; }
  }

  async isDir(path: string): Promise<boolean> {
    try { await this.resolveDir(path); return true; } catch { return false; }
  }
}
