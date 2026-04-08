import { IFileSystem } from "../filesystem/IFileSystem";
import { Vec2 } from "../math/Vec2";

export interface INativeBridge {
  readonly fs: IFileSystem;

  invoke(command: string, args?: Record<string, unknown>): Promise<unknown>;
}

export interface IComputeBackend {
  collideAABB(
    ax: number, ay: number, aw: number, ah: number,
    bx: number, by: number, bw: number, bh: number
  ): Promise<boolean>;

  batchTransform(
    matrices: Float32Array,
    count: number
  ): Promise<Float32Array>;

  noise2D(x: number, y: number, seed: number): Promise<number>;

  pathfind(
    grid: Uint8Array,
    width: number,
    height: number,
    start: Vec2,
    end: Vec2
  ): Promise<Vec2[] | null>;
}

export class NoopCompute implements IComputeBackend {
  async collideAABB(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): Promise<boolean> {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  async batchTransform(matrices: Float32Array, _count: number): Promise<Float32Array> {
    return matrices;
  }

  async noise2D(x: number, y: number, _seed: number): Promise<number> {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  async pathfind(): Promise<Vec2[] | null> {
    console.warn("[Ion] pathfind: no compute backend, returning null");
    return null;
  }
}

export class NullNativeBridge implements INativeBridge {
  readonly fs: IFileSystem;

  constructor(fs: IFileSystem) {
    this.fs = fs;
  }

  async invoke(command: string, _args?: Record<string, unknown>): Promise<unknown> {
    throw new Error(`[Ion] Native invoke "${command}" not available in browser mode`);
  }
}
