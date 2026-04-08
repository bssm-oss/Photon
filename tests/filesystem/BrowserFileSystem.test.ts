import { describe, it, expect } from "vitest";
import { BrowserFileSystem } from "@engine/filesystem/BrowserFileSystem";

describe("BrowserFileSystem", () => {
  it("writes and reads text", async () => {
    const fs = new BrowserFileSystem();
    await fs.writeText("test/hello.txt", "Hello, Ion!");
    const content = await fs.readText("test/hello.txt");
    expect(content).toBe("Hello, Ion!");
  });

  it("writes and reads binary", async () => {
    const fs = new BrowserFileSystem();
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    await fs.writeBinary("test/binary.bin", data);
    const read = await fs.readBinary("test/binary.bin");
    expect([...read]).toEqual([1, 2, 3, 4, 5]);
  });

  it("checks existence", async () => {
    const fs = new BrowserFileSystem();
    expect(await fs.exists("missing.txt")).toBe(false);
    await fs.writeText("exists.txt", "yes");
    expect(await fs.exists("exists.txt")).toBe(true);
  });

  it("removes files", async () => {
    const fs = new BrowserFileSystem();
    await fs.writeText("remove.txt", "bye");
    await fs.remove("remove.txt");
    expect(await fs.exists("remove.txt")).toBe(false);
  });

  it("lists directory", async () => {
    const fs = new BrowserFileSystem();
    await fs.writeText("dir/a.txt", "a");
    await fs.writeText("dir/b.txt", "b");
    await fs.writeText("dir/sub/c.txt", "c");
    const entries = await fs.listDir("dir");
    expect(entries).toContain("a.txt");
    expect(entries).toContain("b.txt");
    expect(entries).toContain("sub");
  });

  it("checks isFile and isDir", async () => {
    const fs = new BrowserFileSystem();
    await fs.writeText("dir/file.txt", "data");
    expect(await fs.isFile("dir/file.txt")).toBe(true);
    expect(await fs.isDir("dir")).toBe(true);
    expect(await fs.isDir("nonexistent")).toBe(false);
  });

  it("throws on reading nonexistent file", async () => {
    const fs = new BrowserFileSystem();
    await expect(fs.readText("nope.txt")).rejects.toThrow("File not found");
  });

  it("persists to and loads from localStorage", async () => {
    const fs1 = new BrowserFileSystem();
    await fs1.writeText("persist.txt", "data");

    const fs2 = new BrowserFileSystem();
    for (const [key, val] of (fs1 as any).storage) {
      (fs2 as any).storage.set(key, val);
    }
    const content = await fs2.readText("persist.txt");
    expect(content).toBe("data");
  });
});
