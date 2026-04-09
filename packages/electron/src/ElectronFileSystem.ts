import { IFileSystem } from "photon-engine";

export class ElectronFileSystem implements IFileSystem {
  private nodeFs: typeof import("fs") | null = null;
  private nodePath: typeof import("path") | null = null;

  private async getFs() {
    if (this.nodeFs && this.nodePath) return { fs: this.nodeFs, path: this.nodePath };
    this.nodeFs = await import("fs");
    this.nodePath = await import("path");
    return { fs: this.nodeFs!, path: this.nodePath! };
  }

  async readText(path: string): Promise<string> {
    const { fs } = await this.getFs();
    return fs.promises.readFile(path, "utf-8");
  }

  async writeText(path: string, content: string): Promise<void> {
    const { fs } = await this.getFs();
    await fs.promises.writeFile(path, content, "utf-8");
  }

  async readBinary(path: string): Promise<Uint8Array> {
    const { fs } = await this.getFs();
    const buf = await fs.promises.readFile(path);
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }

  async writeBinary(path: string, data: Uint8Array): Promise<void> {
    const { fs } = await this.getFs();
    await fs.promises.writeFile(path, data);
  }

  async exists(path: string): Promise<boolean> {
    const { fs } = await this.getFs();
    try { await fs.promises.access(path); return true; } catch { return false; }
  }

  async mkdir(path: string): Promise<void> {
    const { fs } = await this.getFs();
    await fs.promises.mkdir(path, { recursive: true });
  }

  async remove(path: string): Promise<void> {
    const { fs } = await this.getFs();
    await fs.promises.rm(path, { recursive: true, force: true });
  }

  async listDir(path: string): Promise<string[]> {
    const { fs } = await this.getFs();
    const entries = await fs.promises.readdir(path, { withFileTypes: true });
    return entries.map((e) => e.name);
  }

  async isFile(path: string): Promise<boolean> {
    const { fs } = await this.getFs();
    const stat = await fs.promises.stat(path);
    return stat.isFile();
  }

  async isDir(path: string): Promise<boolean> {
    const { fs } = await this.getFs();
    const stat = await fs.promises.stat(path);
    return stat.isDirectory();
  }
}
