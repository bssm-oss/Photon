import { describe, it, expect } from "vitest";
import { Mat3 } from "@engine/math/Mat3";
import { Vec2 } from "@engine/math/Vec2";

describe("Mat3", () => {
  it("creates identity matrix", () => {
    const m = Mat3.identity();
    expect(m.data[0]).toBe(1);
    expect(m.data[4]).toBe(1);
    expect(m.data[8]).toBe(1);
    expect(m.data[1]).toBe(0);
    expect(m.data[2]).toBe(0);
  });

  it("creates translation matrix", () => {
    const m = Mat3.translation(5, 10);
    const p = m.transformPoint(new Vec2(0, 0));
    expect(p.x).toBe(5);
    expect(p.y).toBe(10);
  });

  it("creates scale matrix", () => {
    const m = Mat3.scale(2, 3);
    const p = m.transformPoint(new Vec2(1, 1));
    expect(p.x).toBe(2);
    expect(p.y).toBe(3);
  });

  it("creates rotation matrix", () => {
    const m = Mat3.rotation(Math.PI / 2);
    const p = m.transformPoint(new Vec2(1, 0));
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(1);
  });

  it("multiplies matrices", () => {
    const t = Mat3.translation(10, 20);
    const s = Mat3.scale(2, 3);
    const combined = t.multiply(s);
    const p = combined.transformPoint(new Vec2(1, 1));
    expect(p.x).toBeCloseTo(12);
    expect(p.y).toBeCloseTo(23);
  });

  it("inverts identity to identity", () => {
    const inv = Mat3.identity().invert();
    const p = inv.transformPoint(new Vec2(5, 10));
    expect(p.x).toBeCloseTo(5);
    expect(p.y).toBeCloseTo(10);
  });

  it("inverts translation", () => {
    const t = Mat3.translation(5, 10);
    const inv = t.invert();
    const p = inv.transformPoint(new Vec2(5, 10));
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(0);
  });

  it("orthographic projection maps center to origin", () => {
    const proj = Mat3.orthographic(-640, 640, -360, 360);
    const p = proj.transformPoint(new Vec2(0, 0));
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(0);
  });

  it("clones correctly", () => {
    const m = Mat3.translation(5, 10);
    const c = m.clone();
    c.data[6] = 999;
    expect(m.data[6]).toBe(5);
  });
});
