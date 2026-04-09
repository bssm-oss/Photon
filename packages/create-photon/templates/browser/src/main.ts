import puiSource from "./hud.pui?raw";
import {
  Engine, Scene, Transform2D, Camera2D, Sprite, Component,
  UIText, UIRenderSystem,
  parsePui, loadPui,
} from "photon-engine";

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
  private scoreId = 0;
  private btnId = 0;

  onEnter(): void {
    this.world.registerSystem(this.uiSystem);

    const cam = this.world.createEntity();
    this.world.addComponent(cam.id, new Transform2D());
    this.world.addComponent(cam.id, new Camera2D());

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
      { radius: 80,  speed: 2.0, tilt: 0,           color: [0.3, 0.7, 1.0], size: 8, offset: 0 },
      { radius: 130, speed: 1.3, tilt: Math.PI / 3,  color: [0.4, 1.0, 0.6], size: 7, offset: Math.PI * 0.66 },
      { radius: 180, speed: 0.8, tilt: -Math.PI / 4, color: [1.0, 0.4, 0.8], size: 6, offset: Math.PI * 1.33 },
    ];

    for (const orbit of orbits) {
      const ringCount = 60;
      for (let i = 0; i < ringCount; i++) {
        const dot = this.world.createEntity().tag("ring");
        const dPos = new Transform2D();
        dPos.zIndex = 1;
        this.world.addComponent(dot.id, dPos);
        this.world.addComponent(dot.id, new OrbitalSpeed(
          orbit.radius, 0, (i / ringCount) * Math.PI * 2, orbit.tilt,
        ));
        this.world.addComponent(dot.id, new Sprite(
          orbit.color[0] * 0.3, orbit.color[1] * 0.3, orbit.color[2] * 0.3, 0.25, 2, 2,
        ));
      }

      const electron = this.world.createEntity().tag("electron");
      const ePos = new Transform2D();
      ePos.zIndex = 5;
      this.world.addComponent(electron.id, ePos);
      this.world.addComponent(electron.id, new OrbitalSpeed(
        orbit.radius, orbit.speed, orbit.offset, orbit.tilt,
      ));
      this.world.addComponent(electron.id, new Sprite(
        orbit.color[0], orbit.color[1], orbit.color[2], 1, orbit.size, orbit.size,
      ));
    }

    // Load UI from hud.pui
    const ui = loadPui(this.world, parsePui(puiSource));
    this.scoreId = ui.entities.get("score")!;
    this.btnId   = ui.entities.get("clickBtn")!;

    this.world.eventBus.on<number>("ui:click", (entityId) => {
      if (entityId === this.btnId) {
        this.clickCount++;
        const arch = this.world.getArchetype(this.scoreId);
        if (arch) {
          arch.get<UIText>("uiText")!.text = `Clicks: ${this.clickCount}`;
        }
      }
    });
  }

  onUpdate(): void {
    const time = performance.now() * 0.001;

    for (const arch of this.world.query("transform2d", "orbitalSpeed")) {
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
      const s = nucleusArch.get<Sprite>("sprite")!;
      const pulse = 28 + Math.sin(time * 3) * 4;
      s.width = pulse;
      s.height = pulse;
    }

    const glowArch = this.world.queryByTag("glow")[0];
    if (glowArch) {
      const s = glowArch.get<Sprite>("sprite")!;
      const pulse = 60 + Math.sin(time * 2) * 10;
      s.width = pulse;
      s.height = pulse;
      s.colorA = 0.12 + Math.sin(time * 3) * 0.05;
    }
  }

  onExit(): void { this.world.clear(); }
}

const engine = new Engine({ canvasId: "game-canvas" });
engine.sceneManager.register(new DemoScene());
engine.sceneManager.switchTo("demo");
engine.start();
