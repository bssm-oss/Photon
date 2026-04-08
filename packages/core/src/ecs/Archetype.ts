import { Entity } from "./Entity";
import { Component, ComponentType, ComponentMap } from "./Component";

export class Archetype {
  private components: ComponentMap = new Map();

  constructor(public readonly entity: Entity) {}

  add<T extends Component>(component: T): this {
    this.components.set(component.type, component);
    return this;
  }

  remove(type: ComponentType): Component | undefined {
    const c = this.components.get(type);
    this.components.delete(type);
    return c;
  }

  get<T extends Component>(type: ComponentType): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  has(type: ComponentType): boolean {
    return this.components.has(type);
  }

  hasAll(types: ComponentType[]): boolean {
    for (const t of types) {
      if (!this.components.has(t)) return false;
    }
    return true;
  }

  getAll(): ComponentMap {
    return new Map(this.components);
  }
}
