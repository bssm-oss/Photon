import { Entity } from "./Entity";
import { Archetype } from "./Archetype";
import { System } from "./System";
import { Component, ComponentType } from "./Component";
import { EventBus } from "../event/EventBus";
import type { Scene } from "../scene/Scene";

export class World {
  private archetypes = new Map<number, Archetype>();
  private systems: System[] = [];
  private entityRecycleBin: number[] = [];
  private bus = new EventBus();
  scene?: Scene;

  createEntity(): Entity {
    const id = this.entityRecycleBin.length > 0
      ? this.entityRecycleBin.pop()!
      : undefined;
    const entity = new Entity(id);
    const archetype = new Archetype(entity);
    this.archetypes.set(entity.id, archetype);
    this.bus.emit("entity:created", entity);
    return entity;
  }

  destroyEntity(entityId: number): void {
    const archetype = this.archetypes.get(entityId);
    if (!archetype) return;
    this.bus.emit("entity:destroyed", archetype.entity);
    this.archetypes.delete(entityId);
    this.entityRecycleBin.push(entityId);
  }

  getArchetype(entityId: number): Archetype | undefined {
    return this.archetypes.get(entityId);
  }

  addComponent<T extends Component>(entityId: number, component: T): void {
    const archetype = this.archetypes.get(entityId);
    if (!archetype) return;
    archetype.add(component);
    this.bus.emit("component:added", { entityId, type: component.type });
  }

  removeComponent(entityId: number, type: ComponentType): void {
    const archetype = this.archetypes.get(entityId);
    if (!archetype) return;
    archetype.remove(type);
    this.bus.emit("component:removed", { entityId, type });
  }

  getComponent<T extends Component>(entityId: number, type: ComponentType): T | undefined {
    return this.archetypes.get(entityId)?.get<T>(type);
  }

  getEntity(entityId: number): Entity | undefined {
    return this.archetypes.get(entityId)?.entity;
  }

  hasEntity(entityId: number): boolean {
    return this.archetypes.has(entityId);
  }

  getAllEntities(): Entity[] {
    const result: Entity[] = [];
    for (const [, arch] of this.archetypes) {
      result.push(arch.entity);
    }
    return result;
  }

  registerSystem(system: System): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
    system.onInit(this);
  }

  unregisterSystem(system: System): void {
    const idx = this.systems.indexOf(system);
    if (idx !== -1) {
      system.onDestroy(this);
      this.systems.splice(idx, 1);
    }
  }

  query(...required: ComponentType[]): Archetype[] {
    const result: Archetype[] = [];
    for (const [, archetype] of this.archetypes) {
      if (!archetype.entity.active) continue;
      if (archetype.hasAll(required)) {
        result.push(archetype);
      }
    }
    return result;
  }

  queryByTag(tag: string): Archetype[] {
    const result: Archetype[] = [];
    for (const [, archetype] of this.archetypes) {
      if (archetype.entity.active && archetype.entity.hasTag(tag)) {
        result.push(archetype);
      }
    }
    return result;
  }

  update(dt: number): void {
    for (const system of this.systems) {
      if (!system.active) continue;
      const archetypes = this.query(...system.requiredComponents);
      system.onUpdate(this, archetypes, dt);
    }
  }

  get entityCount(): number { return this.archetypes.size; }

  get eventBus(): EventBus { return this.bus; }

  clear(): void {
    for (const system of this.systems) {
      system.onDestroy(this);
    }
    this.systems = [];
    this.archetypes.clear();
    this.entityRecycleBin = [];
    this.bus.clear();
  }
}
