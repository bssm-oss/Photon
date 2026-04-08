import { describe, it, expect } from "vitest";
import { Transform } from "@engine/math/Transform";

describe("Transform", () => {
  it("has default values", () => {
    const t = new Transform();
    expect(t.position.x).toBe(0);
    expect(t.position.y).toBe(0);
    expect(t.rotation).toBe(0);
    expect(t.scale.x).toBe(1);
    expect(t.scale.y).toBe(1);
  });

  it("computes worldMatrix for translation", () => {
    const t = new Transform();
    t.position.x = 10;
    t.position.y = 20;
    const m = t.worldMatrix;
    const p = m.transformPoint({ x: 0, y: 0 } as any);
    expect(p.x).toBeCloseTo(10);
    expect(p.y).toBeCloseTo(20);
  });

  it("computes worldMatrix with scale", () => {
    const t = new Transform();
    t.scale.x = 2;
    t.scale.y = 3;
    const m = t.worldMatrix;
    const p = m.transformPoint({ x: 1, y: 1 } as any);
    expect(p.x).toBeCloseTo(2);
    expect(p.y).toBeCloseTo(3);
  });

  it("clones correctly", () => {
    const t = new Transform();
    t.position.x = 5;
    const c = t.clone();
    c.position.x = 99;
    expect(t.position.x).toBe(5);
  });
});
