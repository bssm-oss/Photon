import { describe, it, expect } from "vitest";
import { Rect } from "@engine/math/Rect";
import { Vec2 } from "@engine/math/Vec2";

describe("Rect", () => {
  it("computes edges", () => {
    const r = new Rect(10, 20, 100, 50);
    expect(r.left).toBe(10);
    expect(r.right).toBe(110);
    expect(r.top).toBe(20);
    expect(r.bottom).toBe(70);
  });

  it("computes center", () => {
    const r = new Rect(0, 0, 100, 50);
    expect(r.centerX).toBe(50);
    expect(r.centerY).toBe(25);
  });

  it("contains a point", () => {
    const r = new Rect(0, 0, 100, 100);
    expect(r.contains(new Vec2(50, 50))).toBe(true);
    expect(r.contains(new Vec2(150, 50))).toBe(false);
  });

  it("detects intersection", () => {
    const a = new Rect(0, 0, 50, 50);
    const b = new Rect(25, 25, 50, 50);
    const c = new Rect(100, 100, 50, 50);
    expect(a.intersects(b)).toBe(true);
    expect(a.intersects(c)).toBe(false);
  });

  it("clones correctly", () => {
    const r = new Rect(1, 2, 3, 4);
    const c = r.clone();
    c.width = 999;
    expect(r.width).toBe(3);
  });

  it("creates from two points", () => {
    const r = Rect.fromPoints(new Vec2(10, 20), new Vec2(30, 50));
    expect(r.x).toBe(10);
    expect(r.y).toBe(20);
    expect(r.width).toBe(20);
    expect(r.height).toBe(30);
  });
});
