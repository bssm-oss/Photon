let nextId = 1;

export class Entity {
  public readonly id: number;
  public tags: Set<string> = new Set();
  public active: boolean = true;

  constructor(id?: number) {
    this.id = id ?? nextId++;
  }

  tag(...tags: string[]): this {
    for (const t of tags) this.tags.add(t);
    return this;
  }

  untag(...tags: string[]): this {
    for (const t of tags) this.tags.delete(t);
    return this;
  }

  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  equals(other: Entity): boolean {
    return this.id === other.id;
  }
}
