import {
  Engine, Scene, Transform2D, Camera2D, Sprite, Component,
  UITransform, UIText, UIButton, UITextInput, UIPanel,
  UIRenderSystem, Align,
} from "photon-engine";
import { ElectronNativeBridge } from "photon-engine-electron";

class OrbitalSpeed extends Component {
  readonly type = "orbitalSpeed";
  constructor(
    public radius: number = 100,
    public speed: number = 1,
    public angleOffset: number = 0,
    public orbitTilt: number = 0,
  ) { super(); }
}

class DemoScene extends Scene {
  readonly name = "demo";
  private uiSystem = new UIRenderSystem();
  private clickCount = 0;
  private scoreTextEntityId = 0;
  private nameTextEntityId = 0;
  private btnEntityId = 0;

  onEnter(): void {
    this.world.registerSystem(this.uiSystem);

    const cam = this.world.createEntity();
    this.world.addComponent(cam.id, new Transform2D());
    const camComp = new Camera2D();
    this.world.addComponent(cam.id, camComp);

    const nucleus = this.world.createEntity().tag("nucleus");
    const nPos = new Transform2D();
    nPos.zIndex = 10;
    this.world.addComponent(nucleus.id, nPos);
    this.world.addComponent(nucleus.id, new Sprite(0.9, 0.6, 0.1, 1, 28, 28));

    const glow = this.world.createEntity().tag("glow");
    const gPos = new Transform2D();
    gPos.zIndex = 9;
    this.world.addComponent(glow.id, gPos);
    this.world.addComponent(glow.id, new Sprite(0.9, 0.5, 0.1, 0.15, 60, 60));

    const orbits = [
      { radius: 80,  speed: 2.0, tilt: 0,            color: [0.3, 0.7, 1.0], size: 8, offset: 0 },
      { radius: 130, speed: 1.3, tilt: Math.PI / 3,   color: [0.4, 1.0, 0.6], size: 7, offset: Math.PI * 0.66 },
      { radius: 180, speed: 0.8, tilt: -Math.PI / 4,  color: [1.0, 0.4, 0.8], size: 6, offset: Math.PI * 1.33 },
    ];

    for (const orbit of orbits) {
      const ringCount = 60;
      for (let i = 0; i < ringCount; i++) {
        const dot = this.world.createEntity().tag("ring");
        const dPos = new Transform2D();
        dPos.zIndex = 1;
        this.world.addComponent(dot.id, dPos);
        this.world.addComponent(dot.id, new OrbitalSpeed(
          orbit.radius, 0, (i / ringCount) * Math.PI * 2, orbit.tilt
        ));
        this.world.addComponent(dot.id, new Sprite(
          orbit.color[0] * 0.3, orbit.color[1] * 0.3, orbit.color[2] * 0.3, 0.25, 2, 2
        ));
      }

      const electron = this.world.createEntity().tag("electron");
      const ePos = new Transform2D();
      ePos.zIndex = 5;
      this.world.addComponent(electron.id, ePos);
      this.world.addComponent(electron.id, new OrbitalSpeed(
        orbit.radius, orbit.speed, orbit.offset, orbit.tilt
      ));
      this.world.addComponent(electron.id, new Sprite(
        orbit.color[0], orbit.color[1], orbit.color[2], 1, orbit.size, orbit.size
      ));
    }

    this.createUI();

    this.world.eventBus.on<number>("ui:click", (entityId) => {
      if (entityId === this.btnEntityId) {
        this.clickCount++;
        const arch = this.world.getArchetype(this.scoreTextEntityId);
        if (arch) {
          const t = arch.get<UIText>("uiText")!;
          t.text = `Clicks: ${this.clickCount}`;
        }
      }
    });

    this.world.eventBus.on<{ entityId: number; value: string }>("ui:change", (data) => {
      if (data.entityId === this.nameTextEntityId) {
        const arch = this.world.getArchetype(this.nameTextEntityId);
        if (arch) {
          const t = arch.get<UIText>("uiText")!;
        }
      }
    });
  }

  private createUI(): void {
    const sw = this.engine.canvas.getBoundingClientRect().width;
    const sh = this.engine.canvas.getBoundingClientRect().height;

    const panel = this.world.createEntity();
    this.world.addComponent(panel.id, new UITransform(sw / 2 - 170, 20));
    this.world.addComponent(panel.id, new UIPanel(340, 200, 0.08, 0.08, 0.1, 0.85, 8));

    const title = this.world.createEntity();
    this.world.addComponent(title.id, new UITransform(sw / 2, 40));
    this.world.addComponent(title.id, new UIText(
      "Photon Engine — Electron", "sans-serif", 20, 0.5, 0.7, 1, 1, Align.Center, true,
    ));

    const score = this.world.createEntity();
    this.world.addComponent(score.id, new UITransform(sw / 2 - 150, 75));
    this.scoreTextEntityId = score.id;
    this.world.addComponent(score.id, new UIText("Clicks: 0", "monospace", 16, 1, 1, 1, 1));

    const btn = this.world.createEntity();
    this.btnEntityId = btn.id;
    this.world.addComponent(btn.id, new UITransform(sw / 2 - 80, 105));
    this.world.addComponent(btn.id, new UIButton(
      160, 40, "Click Me!",
      0.16, 0.5, 1, 1,
      0.29, 0.62, 1, 1,
      0.1, 0.37, 0.8, 1,
      8, 16, true,
    ));

    const nameLabel = this.world.createEntity();
    this.world.addComponent(nameLabel.id, new UITransform(sw / 2 - 150, 158));
    this.world.addComponent(nameLabel.id, new UIText("Name:", "sans-serif", 14, 0.7, 0.7, 0.7, 1));

    const nameInput = this.world.createEntity();
    this.nameTextEntityId = nameInput.id;
    this.world.addComponent(nameInput.id, new UITransform(sw / 2 - 100, 155));
    this.world.addComponent(nameInput.id, new UITextInput(
      200, 28, "Type here...", 64,
      0.12, 0.12, 0.14, 1,
      0.3, 0.3, 0.3, 1,
      0.3, 0.6, 1, 1,
      14,
    ));
    this.world.addComponent(nameInput.id, new UIText(
      "", "sans-serif", 14, 1, 1, 1, 1,
    ));
  }

  onUpdate(): void {
    const time = performance.now() * 0.001;
    const entities = this.world.query("transform2d", "orbitalSpeed");

    for (const arch of entities) {
      const t = arch.get<Transform2D>("transform2d")!;
      const o = arch.get<OrbitalSpeed>("orbitalSpeed")!;

      const angle = o.angleOffset + time * o.speed;
      const x = Math.cos(angle) * o.radius;
      const y = Math.sin(angle) * o.radius * 0.4;

      const cosT = Math.cos(o.orbitTilt);
      const sinT = Math.sin(o.orbitTilt);
      t.x = x * cosT - y * sinT;
      t.y = x * sinT + y * cosT;
    }

    const nucleusArch = this.world.queryByTag("nucleus")[0];
    if (nucleusArch) {
      const nSprite = nucleusArch.get<Sprite>("sprite")!;
      const pulse = 28 + Math.sin(time * 3) * 4;
      nSprite.width = pulse;
      nSprite.height = pulse;
    }

    const glowArch = this.world.queryByTag("glow")[0];
    if (glowArch) {
      const gSprite = glowArch.get<Sprite>("sprite")!;
      const pulse = 60 + Math.sin(time * 2) * 10;
      gSprite.width = pulse;
      gSprite.height = pulse;
      gSprite.colorA = 0.12 + Math.sin(time * 3) * 0.05;
    }
  }

  onExit(): void { this.world.clear(); }
}

const engine = new Engine({
  canvasId: "game-canvas",
  nativeBridge: new ElectronNativeBridge(),
});
engine.sceneManager.register(new DemoScene());
engine.sceneManager.switchTo("demo");
engine.start();