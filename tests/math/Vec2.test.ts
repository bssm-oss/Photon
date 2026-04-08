import { describe, it, expect } from "vitest";
import { Vec2 } from "@engine/math/Vec2";

describe("Vec2", () => {
  it("creates with default values", () => {
    const v = new Vec2();
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
  });

  it("creates with given values", () => {
    const v = new Vec2(3, 4);
    expect(v.x).toBe(3);
    expect(v.y).toBe(4);
  });

  it("clones correctly", () => {
    const v = new Vec2(1, 2);
    const c = v.clone();
    expect(c.x).toBe(1);
    expect(c.y).toBe(2);
    c.x = 99;
    expect(v.x).toBe(1);
  });

  it("adds vectors", () => {
    const a = new Vec2(1, 2);
    const b = new Vec2(3, 4);
    const r = a.add(b);
    expect(r.x).toBe(4);
    expect(r.y).toBe(6);
  });

  it("subtracts vectors", () => {
    const r = new Vec2(5, 7).sub(new Vec2(2, 3));
    expect(r.x).toBe(3);
    expect(r.y).toBe(4);
  });

  it("multiplies by scalar", () => {
    const r = new Vec2(3, 4).mul(2);
    expect(r.x).toBe(6);
    expect(r.y).toBe(8);
  });

  it("divides by scalar", () => {
    const r = new Vec2(6, 8).div(2);
    expect(r.x).toBe(3);
    expect(r.y).toBe(4);
  });

  it("computes dot product", () => {
    expect(new Vec2(1, 0).dot(new Vec2(0, 1))).toBe(0);
    expect(new Vec2(1, 0).dot(new Vec2(1, 0))).toBe(1);
    expect(new Vec2(3, 4).dot(new Vec2(3, 4))).toBe(25);
  });

  it("computes cross product", () => {
    expect(new Vec2(1, 0).cross(new Vec2(0, 1))).toBe(1);
    expect(new Vec2(1, 0).cross(new Vec2(1, 0))).toBe(0);
  });

  it("computes length", () => {
    expect(new Vec2(3, 4).length()).toBe(5);
    expect(new Vec2(0, 0).length()).toBe(0);
  });

  it("computes lengthSq", () => {
    expect(new Vec2(3, 4).lengthSq()).toBe(25);
  });

  it("normalizes", () => {
    const n = new Vec2(3, 4).normalize();
    expect(n.x).toBeCloseTo(0.6);
    expect(n.y).toBeCloseTo(0.8);
    expect(n.length()).toBeCloseTo(1);
  });

  it("normalizes zero vector to zero", () => {
    const n = Vec2.ZERO.normalize();
    expect(n.x).toBe(0);
    expect(n.y).toBe(0);
  });

  it("computes distance", () => {
    expect(new Vec2(0, 0).distance(new Vec2(3, 4))).toBe(5);
  });

  it("rotates", () => {
    const r = new Vec2(1, 0).rotate(Math.PI / 2);
    expect(r.x).toBeCloseTo(0);
    expect(r.y).toBeCloseTo(1);
  });

  it("lerps between vectors", () => {
    const a = new Vec2(0, 0);
    const b = new Vec2(10, 20);
    const mid = a.lerp(b, 0.5);
    expect(mid.x).toBe(5);
    expect(mid.y).toBe(10);
  });

  it("checks equality", () => {
    expect(new Vec2(1, 2).equals(new Vec2(1, 2))).toBe(true);
    expect(new Vec2(1, 2).equals(new Vec2(1, 3))).toBe(false);
  });

  it("creates from angle", () => {
    const v = Vec2.fromAngle(0);
    expect(v.x).toBeCloseTo(1);
    expect(v.y).toBeCloseTo(0);
  });

  it("static lerp works", () => {
    const r = Vec2.lerp(new Vec2(0, 0), new Vec2(10, 10), 0.3);
    expect(r.x).toBe(3);
    expect(r.y).toBe(3);
  });
});
