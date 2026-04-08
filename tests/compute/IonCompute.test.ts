import { describe, it, expect } from "vitest";
import { IonCompute } from "@ion-engine/compute/IonCompute";
import { Vec2 } from "ion-engine";

describe("IonCompute", () => {
  const compute = new IonCompute();

  describe("collideAABB", () => {
    it("detects overlap", async () => {
      const hit = await compute.collideAABB(0, 0, 10, 10, 5, 5, 10, 10);
      expect(hit).toBe(true);
    });

    it("detects no overlap", async () => {
      const hit = await compute.collideAABB(0, 0, 10, 10, 20, 20, 10, 10);
      expect(hit).toBe(false);
    });

    it("touching edge is not collision", async () => {
      const hit = await compute.collideAABB(0, 0, 10, 10, 10, 0, 10, 10);
      expect(hit).toBe(false);
    });
  });

  describe("noise2D", () => {
    it("returns value between 0 and 1", async () => {
      const val = await compute.noise2D(1, 2, 42);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    it("is deterministic", async () => {
      const a = await compute.noise2D(3, 4, 7);
      const b = await compute.noise2D(3, 4, 7);
      expect(a).toBeCloseTo(b);
    });

    it("different seeds produce different values", async () => {
      const a = await compute.noise2D(1, 1, 1);
      const b = await compute.noise2D(1, 1, 99);
      expect(Math.abs(a - b)).toBeGreaterThan(0.01);
    });
  });

  describe("noiseGrid", () => {
    it("generates grid of correct size", async () => {
      const grid = await compute.noiseGrid(10, 5, 10, 0);
      expect(grid.length).toBe(50);
    });

    it("all values in [0, 1)", async () => {
      const grid = await compute.noiseGrid(20, 20, 10, 0);
      for (let i = 0; i < grid.length; i++) {
        expect(grid[i]).toBeGreaterThanOrEqual(0);
        expect(grid[i]).toBeLessThan(1);
      }
    });
  });

  describe("pathfind", () => {
    const makeGrid = (w: number, h: number, walls: Array<[number, number]>) => {
      const grid = new Uint8Array(w * h);
      for (const [x, y] of walls) grid[y * w + x] = 1;
      return grid;
    };

    it("finds straight line path", async () => {
      const grid = new Uint8Array(9);
      const result = await compute.pathfind(grid, 3, 3, new Vec2(0, 0), new Vec2(2, 0));
      expect(result).not.toBeNull();
      expect(result![0].x).toBe(0);
      expect(result![result!.length - 1].x).toBe(2);
    });

    it("finds path around wall", async () => {
      const grid = makeGrid(3, 3, [[1, 0], [1, 1]]);
      const result = await compute.pathfind(grid, 3, 3, new Vec2(0, 0), new Vec2(2, 0));
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThan(2);
    });

    it("returns null when no path exists", async () => {
      const grid = makeGrid(3, 3, [[1, 0], [1, 1], [1, 2]]);
      const result = await compute.pathfind(grid, 3, 3, new Vec2(0, 0), new Vec2(2, 0));
      expect(result).toBeNull();
    });

    it("returns null when start is blocked", async () => {
      const grid = makeGrid(3, 3, [[0, 0]]);
      const result = await compute.pathfind(grid, 3, 3, new Vec2(0, 0), new Vec2(2, 2));
      expect(result).toBeNull();
    });

    it("returns null for out of bounds", async () => {
      const grid = new Uint8Array(4);
      const result = await compute.pathfind(grid, 2, 2, new Vec2(0, 0), new Vec2(5, 5));
      expect(result).toBeNull();
    });

    it("same start and end returns single point", async () => {
      const grid = new Uint8Array(9);
      const result = await compute.pathfind(grid, 3, 3, new Vec2(1, 1), new Vec2(1, 1));
      expect(result).not.toBeNull();
      expect(result!.length).toBe(1);
    });
  });

  describe("spatialHash", () => {
    it("groups nearby entities", async () => {
      const positions = new Float32Array([10, 10, 12, 12, 100, 100]);
      const grid = await compute.spatialHash(positions, 3, 64);
      expect(grid.size).toBeGreaterThan(0);
    });
  });

  describe("batchCollide", () => {
    it("finds overlapping pairs", async () => {
      const positions = new Float32Array([0, 0, 5, 5, 100, 100]);
      const sizes = new Float32Array([10, 10, 10, 10, 10, 10]);
      const pairs = await compute.batchCollide(positions, sizes, 3);
      expect(pairs.length).toBe(1);
      expect(pairs[0]).toEqual([0, 1]);
    });

    it("finds no pairs for separated entities", async () => {
      const positions = new Float32Array([0, 0, 100, 100]);
      const sizes = new Float32Array([10, 10, 10, 10]);
      const pairs = await compute.batchCollide(positions, sizes, 2);
      expect(pairs.length).toBe(0);
    });
  });

  describe("batchTransform", () => {
    it("returns correct slice", async () => {
      const matrices = new Float32Array([
        1, 0, 0, 0, 1, 0, 5, 10, 1,
        2, 0, 0, 0, 2, 0, 20, 30, 1,
      ]);
      const result = await compute.batchTransform(matrices, 1);
      expect(result.length).toBe(9);
      expect(result[6]).toBe(5);
    });
  });
});
