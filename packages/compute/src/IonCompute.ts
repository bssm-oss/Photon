import { IComputeBackend, Vec2 } from "ion-engine";

export class IonCompute implements IComputeBackend {
  async collideAABB(
    ax: number, ay: number, aw: number, ah: number,
    bx: number, by: number, bw: number, bh: number
  ): Promise<boolean> {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  async batchTransform(matrices: Float32Array, count: number): Promise<Float32Array> {
    return matrices.slice(0, count * 9);
  }

  async noise2D(x: number, y: number, seed: number): Promise<number> {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  async noiseGrid(
    width: number, height: number, scale: number, seed: number
  ): Promise<Float32Array> {
    const result = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const val = await this.noise2D(x / scale, y / scale, seed);
        result[y * width + x] = val;
      }
    }
    return result;
  }

  async pathfind(
    grid: Uint8Array,
    width: number,
    height: number,
    start: Vec2,
    end: Vec2
  ): Promise<Vec2[] | null> {
    const sx = Math.floor(start.x);
    const sy = Math.floor(start.y);
    const ex = Math.floor(end.x);
    const ey = Math.floor(end.y);

    if (sx < 0 || sy < 0 || ex < 0 || ey < 0) return null;
    if (sx >= width || sy >= height || ex >= width || ey >= height) return null;

    const idx = (x: number, y: number) => y * width + x;

    if (grid[idx(sx, sy)] === 1 || grid[idx(ex, ey)] === 1) return null;

    const total = width * height;
    const visited = new Uint8Array(total);
    const parent = new Int32Array(total).fill(-1);
    const gScore = new Float32Array(total).fill(Infinity);

    const heuristic = (x: number, y: number) =>
      Math.abs(x - ex) + Math.abs(y - ey);

    const open: number[] = [];
    const startIdx = idx(sx, sy);
    gScore[startIdx] = 0;
    open.push(startIdx);
    visited[startIdx] = 1;

    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    while (open.length > 0) {
      let bestIdx = 0;
      let bestF = Infinity;
      for (let i = 0; i < open.length; i++) {
        const node = open[i];
        const nx = node % width;
        const ny = Math.floor(node / width);
        const f = gScore[node] + heuristic(nx, ny);
        if (f < bestF) {
          bestF = f;
          bestIdx = i;
        }
      }

      const current = open[bestIdx];
      open.splice(bestIdx, 1);
      const cx = current % width;
      const cy = Math.floor(current / width);

      if (cx === ex && cy === ey) {
        const path: Vec2[] = [];
        let node = current;
        while (node !== -1) {
          path.push(new Vec2(node % width, Math.floor(node / width)));
          node = parent[node];
        }
        return path.reverse();
      }

      for (const [dx, dy] of dirs) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const nIdx = idx(nx, ny);
        if (grid[nIdx] === 1 || visited[nIdx]) continue;

        visited[nIdx] = 1;
        const newG = gScore[current] + 1;
        if (newG < gScore[nIdx]) {
          gScore[nIdx] = newG;
          parent[nIdx] = current;
          open.push(nIdx);
        }
      }
    }

    return null;
  }

  async spatialHash(
    positions: Float32Array,
    count: number,
    cellSize: number
  ): Promise<Map<number, number[]>> {
    const grid = new Map<number, number[]>();
    for (let i = 0; i < count; i++) {
      const x = positions[i * 2];
      const y = positions[i * 2 + 1];
      const key = (Math.floor(x / cellSize) * 73856093) ^ (Math.floor(y / cellSize) * 19349663);
      const hash = key & 0x7fffffff;
      if (!grid.has(hash)) grid.set(hash, []);
      grid.get(hash)!.push(i);
    }
    return grid;
  }

  async batchCollide(
    positions: Float32Array,
    sizes: Float32Array,
    count: number
  ): Promise<Array<[number, number]>> {
    const pairs: Array<[number, number]> = [];
    const cellSize = 64;
    const grid = await this.spatialHash(positions, count, cellSize);

    for (const [, indices] of grid) {
      for (let i = 0; i < indices.length; i++) {
        for (let j = i + 1; j < indices.length; j++) {
          const a = indices[i];
          const b = indices[j];
          const hit = await this.collideAABB(
            positions[a * 2], positions[a * 2 + 1],
            sizes[a * 2], sizes[a * 2 + 1],
            positions[b * 2], positions[b * 2 + 1],
            sizes[b * 2], sizes[b * 2 + 1]
          );
          if (hit) pairs.push([a, b]);
        }
      }
    }
    return pairs;
  }
}
