import { World } from "./World";
import { Archetype } from "./Archetype";

export abstract class System {
  public priority: number = 0;
  public active: boolean = true;

  abstract readonly requiredComponents: string[];

  abstract onInit(world: World): void;
  abstract onUpdate(world: World, archetypes: Archetype[], dt: number): void;
  abstract onDestroy(world: World): void;
}
