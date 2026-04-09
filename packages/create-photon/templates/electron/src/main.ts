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

  private panelId = 0;
  private titleId = 0;
  private scoreId = 0;
  private scoreTextId = 0;
  private btnId = 0;
  private labelId = 0;
  private inputId = 0;
  private inputTextId = 0;

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
    this.layoutUI();

    this.world.eventBus.on<number>("ui:click", (entityId) => {
      if (entityId === this.btnId) {
        this.clickCount++;
        const arch = this.world.getArchetype(this.scoreTextId);
        if (arch) {
          const t = arch.get<UIText>("uiText")!;
          t.text = `Clicks: ${this.clickCount}`;
        }
      }
    });

    this.engine.eventBus.on("engine:resize", () => this.layoutUI());
  }

  private createUI(): void {
    this.panelId = this.world.createEntity().id;
    this.world.addComponent(this.panelId, new UITransform(0, 0));
    this.world.addComponent(this.panelId, new UIPanel(340, 180, 0.08, 0.08, 0.1, 0.85, 8));

    this.titleId = this.world.createEntity().id;
    this.world.addComponent(this.titleId, new UITransform(0, 0));
    this.world.addComponent(this.titleId, new UIText(
      "Photon Engine — Electron", "sans-serif", 20, 0.5, 0.7, 1, 1, Align.Center, true,
    ));

    this.scoreId = this.world.createEntity().id;
    this.world.addComponent(this.scoreId, new UITransform(0, 0));
    this.world.addComponent(this.scoreId, new UIText("Clicks: 0", "monospace", 16, 1, 1, 1, 1));

    this.btnId = this.world.createEntity().id;
    this.world.addComponent(this.btnId, new UITransform(0, 0));
    this.world.addComponent(this.btnId, new UIButton(
      160, 40, "Click Me!",
      0.16, 0.5, 1, 1,
      0.29, 0.62, 1, 1,
      0.1, 0.37, 0.8, 1,
      8, 16, true,
    ));

    this.labelId = this.world.createEntity().id;
    this.world.addComponent(this.labelId, new UITransform(0, 0));
    this.world.addComponent(this.labelId, new UIText("Name:", "sans-serif", 14, 0.7, 0.7, 0.7, 1));

    this.inputId = this.world.createEntity().id;
    this.world.addComponent(this.inputId, new UITransform(0, 0));
    this.world.addComponent(this.inputId, new UITextInput(
      200, 28, "Type here...", 64,
      0.12, 0.12, 0.14, 1,
      0.3, 0.3, 0.3, 1,
      0.3, 0.6, 1, 1,
      14,
    ));
    this.world.addComponent(this.inputId, new UIText(
      "", "sans-serif", 14, 1, 1, 1, 1,
    ));
  }

  private layoutUI(): void {
    const sw = this.engine.cssWidth;
    const sh = this.engine.cssHeight;

    const archPanel = this.world.getArchetype(this.panelId);
    if (archPanel) archPanel.get<UITransform>("uiTransform")!.x = sw / 2 - 170;

    const archTitle = this.world.getArchetype(this.titleId);
    if (archTitle) archTitle.get<UITransform>("uiTransform")!.x = sw / 2;

    const archScore = this.world.getArchetype(this.scoreId);
    if (archScore) archScore.get<UITransform>("uiTransform")!.x = sw / 2 - 150;

    const archBtn = this.world.getArchetype(this.btnId);
    if (archBtn) archBtn.get<UITransform>("uiTransform")!.x = sw / 2 - 80;

    const archLabel = this.world.getArchetype(this.labelId);
    if (archLabel) archLabel.get<UITransform>("uiTransform")!.x = sw / 2 - 150;

    const archInput = this.world.getArchetype(this.inputId);
    if (archInput) archInput.get<UITransform>("uiTransform")!.x = sw / 2 - 100;
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