import { describe, it, expect } from "vitest";
import { World } from "@engine/ecs/World";
import { System } from "@engine/ecs/System";
import { Archetype } from "@engine/ecs/Archetype";
import { Position, Velocity, Health } from "./TestComponents";

class TestSystem extends System {
  readonly requiredComponents = ["position", "velocity"];
  priority = 0;
  updatedArchetypes: Archetype[][] = [];

  onInit() {}
  onUpdate(_world: World, archetypes: Archetype[], dt: number) {
    this.updatedArchetypes.push(archetypes);
    for (const arch of archetypes) {
      const pos = arch.get<Position>("position")!;
      const vel = arch.get<Velocity>("velocity")!;
      pos.x += vel.dx * dt;
      pos.y += vel.dy * dt;
    }
  }
  onDestroy() {}
}

describe("World", () => {
  it("creates entities", () => {
    const world = new World();
    const e = world.createEntity();
    expect(e.id).toBeGreaterThan(0);
    expect(world.entityCount).toBe(1);
  });

  it("destroys entities", () => {
    const world = new World();
    const e = world.createEntity();
    world.destroyEntity(e.id);
    expect(world.entityCount).toBe(0);
  });

  it("adds and gets components", () => {
    const world = new World();
    const e = world.createEntity();
    world.addComponent(e.id, new Position(10, 20));
    const pos = world.getComponent<Position>(e.id, "position");
    expect(pos).toBeDefined();
    expect(pos!.x).toBe(10);
    expect(pos!.y).toBe(20);
  });

  it("removes components", () => {
    const world = new World();
    const e = world.createEntity();
    world.addComponent(e.id, new Position());
    world.removeComponent(e.id, "position");
    expect(world.getComponent(e.id, "position")).toBeUndefined();
  });

  it("queries by component types", () => {
    const world = new World();

    const e1 = world.createEntity();
    world.addComponent(e1.id, new Position(1, 0));
    world.addComponent(e1.id, new Velocity(10, 0));

    const e2 = world.createEntity();
    world.addComponent(e2.id, new Position(2, 0));

    const e3 = world.createEntity();
    world.addComponent(e3.id, new Position(3, 0));
    world.addComponent(e3.id, new Velocity(30, 0));

    const result = world.query("position", "velocity");
    expect(result.length).toBe(2);
  });

  it("skips inactive entities in query", () => {
    const world = new World();
    const e1 = world.createEntity();
    world.addComponent(e1.id, new Position());
    e1.active = false;

    const e2 = world.createEntity();
    world.addComponent(e2.id, new Position());

    expect(world.query("position").length).toBe(1);
  });

  it("queries by tag", () => {
    const world = new World();
    const e1 = world.createEntity().tag("player");
    world.addComponent(e1.id, new Position());
    const e2 = world.createEntity().tag("enemy");
    world.addComponent(e2.id, new Position());

    expect(world.queryByTag("player").length).toBe(1);
    expect(world.queryByTag("enemy").length).toBe(1);
  });

  it("runs systems in update", () => {
    const world = new World();
    const sys = new TestSystem();
    world.registerSystem(sys);

    const e = world.createEntity();
    world.addComponent(e.id, new Position(0, 0));
    world.addComponent(e.id, new Velocity(10, 5));

    world.update(1);

    const pos = world.getComponent<Position>(e.id, "position")!;
    expect(pos.x).toBe(10);
    expect(pos.y).toBe(5);
  });

  it("runs systems in priority order", () => {
    const order: number[] = [];

    class SysA extends System {
      readonly requiredComponents = ["position"];
      priority = 10;
      onInit() {}
      onUpdate() { order.push(10); }
      onDestroy() {}
    }

    class SysB extends System {
      readonly requiredComponents = ["position"];
      priority = 1;
      onInit() {}
      onUpdate() { order.push(1); }
      onDestroy() {}
    }

    const world = new World();
    world.registerSystem(new SysA());
    world.registerSystem(new SysB());

    const e = world.createEntity();
    world.addComponent(e.id, new Position());

    world.update(1);
    expect(order).toEqual([1, 10]);
  });

  it("skips inactive systems", () => {
    const world = new World();
    const sys = new TestSystem();
    sys.active = false;
    world.registerSystem(sys);

    const e = world.createEntity();
    world.addComponent(e.id, new Position());
    world.addComponent(e.id, new Velocity(10, 0));

    world.update(1);
    expect(sys.updatedArchetypes.length).toBe(0);
  });

  it("unregisters systems", () => {
    const world = new World();
    const sys = new TestSystem();
    world.registerSystem(sys);
    world.unregisterSystem(sys);

    const e = world.createEntity();
    world.addComponent(e.id, new Position());
    world.addComponent(e.id, new Velocity(10, 0));

    world.update(1);
    expect(sys.updatedArchetypes.length).toBe(0);
  });

  it("emits events on entity lifecycle", () => {
    const world = new World();
    const events: string[] = [];

    world.eventBus.on("entity:created", () => events.push("created"));
    world.eventBus.on("entity:destroyed", () => events.push("destroyed"));

    const e = world.createEntity();
    world.destroyEntity(e.id);

    expect(events).toEqual(["created", "destroyed"]);
  });

  it("emits events on component lifecycle", () => {
    const world = new World();
    const events: string[] = [];

    world.eventBus.on("component:added", () => events.push("added"));
    world.eventBus.on("component:removed", () => events.push("removed"));

    const e = world.createEntity();
    world.addComponent(e.id, new Position());
    world.removeComponent(e.id, "position");

    expect(events).toEqual(["added", "removed"]);
  });

  it("recycles entity IDs", () => {
    const world = new World();
    const e1 = world.createEntity();
    const id1 = e1.id;
    world.destroyEntity(id1);
    const e2 = world.createEntity();
    expect(e2.id).toBe(id1);
  });

  it("clears everything", () => {
    const world = new World();
    world.registerSystem(new TestSystem());
    world.createEntity();
    world.clear();
    expect(world.entityCount).toBe(0);
  });
});
