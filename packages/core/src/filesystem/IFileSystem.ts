export interface IFileSystem {
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
  readBinary(path: string): Promise<Uint8Array>;
  writeBinary(path: string, data: Uint8Array): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  remove(path: string): Promise<void>;
  listDir(path: string): Promise<string[]>;
  isFile(path: string): Promise<boolean>;
  isDir(path: string): Promise<boolean>;
}
