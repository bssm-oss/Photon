import { describe, it, expect } from "vitest";
import { Scene } from "@engine/scene/Scene";
import { SceneManager } from "@engine/scene/SceneManager";
import { Position, Velocity } from "../ecs/TestComponents";

class SceneA extends Scene {
  readonly name = "scene-a";
  onEnter() {}
  onUpdate() {}
  onExit() {}
}

class SceneB extends Scene {
  readonly name = "scene-b";
  onEnter() {}
  onUpdate() {}
  onExit() {}
}

describe("SceneManager", () => {
  it("registers and lists scenes", () => {
    const mgr = new SceneManager();
    mgr.register(new SceneA());
    mgr.register(new SceneB());
    expect(mgr.sceneNames).toContain("scene-a");
    expect(mgr.sceneNames).toContain("scene-b");
  });

  it("switches scenes", () => {
    const mgr = new SceneManager();
    const a = new SceneA();
    const b = new SceneB();
    mgr.register(a);
    mgr.register(b);

    mgr.switchTo("scene-a");
    expect(mgr.currentScene).toBe(a);

    mgr.switchTo("scene-b");
    expect(mgr.currentScene).toBe(b);
  });

  it("returns false for unknown scene", () => {
    const mgr = new SceneManager();
    expect(mgr.switchTo("nonexistent")).toBe(false);
  });

  it("calls onEnter and onExit", () => {
    const mgr = new SceneManager();
    let enterCount = 0;
    let exitCount = 0;

    class TestScene extends Scene {
      readonly name = "test";
      onEnter() { enterCount++; }
      onUpdate() {}
      onExit() { exitCount++; }
    }

    mgr.register(new TestScene());
    mgr.switchTo("test");
    expect(enterCount).toBe(1);

    mgr.register(new SceneA());
    mgr.switchTo("scene-a");
    expect(exitCount).toBe(1);
  });

  it("unregisters scene", () => {
    const mgr = new SceneManager();
    mgr.register(new SceneA());
    mgr.switchTo("scene-a");
    mgr.unregister("scene-a");
    expect(mgr.currentScene).toBeNull();
  });
});

describe("Scene entity migration", () => {
  it("moves entity between scenes", () => {
    const a = new SceneA();
    const b = new SceneB();

    const e = a.world.createEntity().tag("player");
    a.world.addComponent(e.id, new Position(10, 20));
    a.world.addComponent(e.id, new Velocity(5, 0));

    const result = a.moveEntityTo(e.id, b);

    expect(result).toBe(true);
    expect(a.world.entityCount).toBe(0);
    expect(b.world.entityCount).toBe(1);

    const archetypes = b.world.query("position", "velocity");
    expect(archetypes.length).toBe(1);

    const pos = archetypes[0].get<Position>("position")!;
    expect(pos.x).toBe(10);
    expect(pos.y).toBe(20);

    expect(archetypes[0].entity.hasTag("player")).toBe(true);
  });

  it("fails to move nonexistent entity", () => {
    const a = new SceneA();
    const b = new SceneB();
    expect(a.moveEntityTo(99999, b)).toBe(false);
  });

  it("copies entity to another scene", () => {
    const a = new SceneA();
    const b = new SceneB();

    const e = a.world.createEntity().tag("original");
    a.world.addComponent(e.id, new Position(42, 0));

    const copy = a.copyEntityTo(e.id, b);

    expect(copy).not.toBeNull();
    expect(a.world.entityCount).toBe(1);
    expect(b.world.entityCount).toBe(1);

    const bArchetypes = b.world.query("position");
    const pos = bArchetypes[0].get<Position>("position")!;
    expect(pos.x).toBe(42);

    expect(bArchetypes[0].entity.hasTag("original")).toBe(true);
  });

  it("returns null for copying nonexistent entity", () => {
    const a = new SceneA();
    const b = new SceneB();
    expect(a.copyEntityTo(99999, b)).toBeNull();
  });
});
