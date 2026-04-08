import { describe, it, expect } from "vitest";
import { Camera2D, Transform2D } from "@engine/view/Camera2D";
import { Vec2 } from "@engine/math/Vec2";

describe("Transform2D", () => {
  it("has default values", () => {
    const t = new Transform2D();
    expect(t.x).toBe(0);
    expect(t.y).toBe(0);
    expect(t.rotation).toBe(0);
    expect(t.scaleX).toBe(1);
    expect(t.scaleY).toBe(1);
    expect(t.zIndex).toBe(0);
  });

  it("gets and sets position via Vec2", () => {
    const t = new Transform2D();
    t.position = new Vec2(10, 20);
    expect(t.position.x).toBe(10);
    expect(t.position.y).toBe(20);
    expect(t.x).toBe(10);
    expect(t.y).toBe(20);
  });

  it("computes local matrix for translation", () => {
    const t = new Transform2D();
    t.x = 5;
    t.y = 10;
    const m = t.getLocalMatrix();
    const origin = m.transformPoint(new Vec2(0, 0));
    expect(origin.x).toBeCloseTo(5);
    expect(origin.y).toBeCloseTo(10);
  });

  it("computes local matrix with rotation", () => {
    const t = new Transform2D();
    t.rotation = Math.PI / 2;
    const m = t.getLocalMatrix();
    const p = m.transformPoint(new Vec2(1, 0));
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(1);
  });

  it("has correct type", () => {
    expect(new Transform2D().type).toBe("transform2d");
  });
});

describe("Camera2D", () => {
  it("has default values", () => {
    const c = new Camera2D();
    expect(c.x).toBe(0);
    expect(c.y).toBe(0);
    expect(c.zoom).toBe(1);
    expect(c.rotation).toBe(0);
    expect(c.viewportWidth).toBe(1280);
    expect(c.viewportHeight).toBe(720);
  });

  it("gets and sets position via Vec2", () => {
    const c = new Camera2D();
    c.position = new Vec2(100, 200);
    expect(c.x).toBe(100);
    expect(c.y).toBe(200);
  });

  it("computes visible bounds", () => {
    const c = new Camera2D();
    c.zoom = 1;
    const bounds = c.getVisibleBounds();
    expect(bounds.width).toBe(1280);
    expect(bounds.height).toBe(720);
    expect(bounds.centerX).toBeCloseTo(0);
    expect(bounds.centerY).toBeCloseTo(0);
  });

  it("visible bounds shrink with zoom", () => {
    const c = new Camera2D();
    c.zoom = 2;
    const bounds = c.getVisibleBounds();
    expect(bounds.width).toBe(640);
    expect(bounds.height).toBe(360);
  });

  it("has correct type", () => {
    expect(new Camera2D().type).toBe("camera2d");
  });
});
