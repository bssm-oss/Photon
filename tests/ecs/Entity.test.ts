import { describe, it, expect } from "vitest";
import { Entity } from "@engine/ecs/Entity";

describe("Entity", () => {
  it("has unique IDs", () => {
    const a = new Entity();
    const b = new Entity();
    expect(a.id).not.toBe(b.id);
  });

  it("accepts specific ID", () => {
    const e = new Entity(42);
    expect(e.id).toBe(42);
  });

  it("is active by default", () => {
    expect(new Entity().active).toBe(true);
  });

  it("tags and untags", () => {
    const e = new Entity();
    e.tag("player", "damageable");
    expect(e.hasTag("player")).toBe(true);
    expect(e.hasTag("damageable")).toBe(true);
    expect(e.hasTag("enemy")).toBe(false);

    e.untag("damageable");
    expect(e.hasTag("damageable")).toBe(false);
  });

  it("compares by id", () => {
    const a = new Entity(1);
    const b = new Entity(1);
    const c = new Entity(2);
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
