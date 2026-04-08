import { World } from "../ecs/World";
import { System } from "../ecs/System";
import { Archetype } from "../ecs/Archetype";
import { Transform2D } from "../view/Camera2D";

export class RenderSystem extends System {
  readonly requiredComponents = ["transform2d", "sprite"];
  priority = 1000;

  onInit(_world: World): void {}

  onUpdate(_world: World, archetypes: Archetype[], _dt: number): void {
    archetypes.sort((a, b) => {
      const za = a.get<Transform2D>("transform2d")?.zIndex ?? 0;
      const zb = b.get<Transform2D>("transform2d")?.zIndex ?? 0;
      return za - zb;
    });
  }

  onDestroy(_world: World): void {}
}
