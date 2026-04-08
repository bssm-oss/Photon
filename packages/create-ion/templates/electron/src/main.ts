import { Engine, Scene, Transform2D, Camera2D, Sprite } from "ion-engine";
import { ElectronNativeBridge } from "@ion-engine/electron";

class GameScene extends Scene {
  readonly name = "game";

  onEnter(): void {
    const cam = this.world.createEntity();
    this.world.addComponent(cam.id, new Transform2D());
    this.world.addComponent(cam.id, new Camera2D());

    const player = this.world.createEntity();
    const pos = new Transform2D();
    this.world.addComponent(player.id, pos);
    this.world.addComponent(player.id, new Sprite(1, 0.5, 0.2, 1, 32, 32));
  }

  onUpdate(dt: number): void {
    const entities = this.world.query("transform2d");
    for (const arch of entities) {
      if (!arch.entity.hasTag("camera")) {
        const t = arch.get<Transform2D>("transform2d")!;
        t.x += 30 * dt;
      }
    }
  }

  onExit(): void { this.world.clear(); }
}

const engine = new Engine({
  canvasId: "game-canvas",
  nativeBridge: new ElectronNativeBridge(),
});
engine.sceneManager.register(new GameScene());
engine.sceneManager.switchTo("game");
engine.start();
