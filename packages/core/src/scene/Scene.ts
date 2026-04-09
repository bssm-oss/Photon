import { World, Entity, Archetype, Component, ComponentType } from "../ecs";
import type { Engine } from "../core/Engine";

export abstract class Scene {
  readonly world: World;
  engine!: Engine;

  abstract readonly name: string;

  constructor() {
    this.world = new World();
    this.world.scene = this;
  }

  abstract onEnter(): void;
  abstract onUpdate(dt: number): void;
  abstract onExit(): void;

  moveEntityTo(entityId: number, targetScene: Scene): boolean {
    const src = this.world.getArchetype(entityId);
    if (!src) return false;

    const components = src.getAll();
    const entity = src.entity;

    this.world.destroyEntity(entityId);

    const newEntity = targetScene.world.createEntity();
    newEntity.tags = new Set(entity.tags);
    newEntity.active = entity.active;

    const newArch = targetScene.world.getArchetype(newEntity.id)!;
    for (const [, component] of components) {
      newArch.add(component);
    }

    return true;
  }

  copyEntityTo(entityId: number, targetScene: Scene): Entity | null {
    const src = this.world.getArchetype(entityId);
    if (!src) return null;

    const newEntity = targetScene.world.createEntity();
    newEntity.tags = new Set(src.entity.tags);

    const newArch = targetScene.world.getArchetype(newEntity.id)!;
    for (const [, component] of src.getAll()) {
      newArch.add(component);
    }

    return newEntity;
  }
}
