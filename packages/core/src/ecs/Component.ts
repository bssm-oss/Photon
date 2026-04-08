export type ComponentType = string;

export interface IComponent {
  readonly type: ComponentType;
}

export abstract class Component implements IComponent {
  abstract readonly type: ComponentType;
}

export type ComponentMap = Map<ComponentType, Component>;
