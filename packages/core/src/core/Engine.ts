import { SceneManager } from "../scene/SceneManager";
import { Renderer } from "../renderer/Renderer";
import { InputManager } from "../input/InputManager";
import { INativeBridge, NullNativeBridge } from "./INativeBridge";
import { IFileSystem } from "../filesystem/IFileSystem";
import { BrowserFileSystem } from "../filesystem/BrowserFileSystem";
import { EventBus } from "../event/EventBus";
import { Camera2D, Transform2D } from "../view/Camera2D";
import { Sprite } from "../renderer/Sprite";
import { Mat3 } from "../math/Mat3";
import { NoopCompute } from "./INativeBridge";

export interface EngineConfig {
  canvasId?: string;
  width?: number;
  height?: number;
  fs?: IFileSystem;
  nativeBridge?: INativeBridge;
}

export class Engine {
  readonly sceneManager: SceneManager;
  readonly renderer: Renderer;
  readonly input: InputManager;
  readonly eventBus: EventBus;
  readonly fs: IFileSystem;
  readonly bridge: INativeBridge;
  readonly compute;

  private running = false;
  private lastTime = 0;
  private rafId = 0;
  private fixedAccumulator = 0;
  private readonly fixedStep = 1000 / 60;

  readonly canvas: HTMLCanvasElement;

  constructor(config: EngineConfig = {}) {
    const canvasId = config.canvasId ?? "photon-canvas";
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error(`Canvas "#${canvasId}" not found`);

    canvas.width = config.width ?? window.innerWidth;
    canvas.height = config.height ?? window.innerHeight;
    this.canvas = canvas;

    this.eventBus = new EventBus();
    this.renderer = new Renderer(canvas);
    this.input = new InputManager(canvas);
    this.sceneManager = new SceneManager(this.eventBus);

    if (config.fs) {
      this.fs = config.fs;
    } else {
      const bfs = new BrowserFileSystem();
      bfs.loadFromLocalStorage();
      this.fs = bfs;
    }

    this.bridge = config.nativeBridge ?? new NullNativeBridge(this.fs);
    this.compute = new NoopCompute();

    window.addEventListener("resize", () => this.handleResize());
  }

  private handleResize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.renderer.resize(this.canvas.width, this.canvas.height);
    this.eventBus.emit("engine:resize", {
      width: this.canvas.width,
      height: this.canvas.height,
    });
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.input.init();
    this.lastTime = performance.now();
    this.loop(this.lastTime);
    this.eventBus.emit("engine:start", null);
  }

  stop(): void {
    this.running = false;
    this.input.destroy();
    cancelAnimationFrame(this.rafId);
    this.eventBus.emit("engine:stop", null);
  }

  private loop = (now: number): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.loop);

    const rawDt = now - this.lastTime;
    this.lastTime = now;
    const dt = Math.min(rawDt, 250);

    this.fixedAccumulator += dt;
    while (this.fixedAccumulator >= this.fixedStep) {
      this.fixedUpdate(this.fixedStep / 1000);
      this.fixedAccumulator -= this.fixedStep;
    }

    this.update(dt / 1000);
    this.render();

    this.input.endFrame();
  };

  private fixedUpdate(dt: number): void {
    const scene = this.sceneManager.currentScene;
    if (!scene) return;
    scene.world.update(dt);
    scene.onUpdate(dt);
  }

  private update(_dt: number): void {}

  private render(): void {
    const scene = this.sceneManager.currentScene;
    if (!scene) {
      this.renderer.clear(0.1, 0.1, 0.1);
      return;
    }

    const cameras = scene.world.query("camera2d", "transform2d");
    if (cameras.length === 0) {
      this.renderer.clear(0.1, 0.1, 0.1);
      return;
    }

    const camArch = cameras[0];
    const camComp = camArch.get<Camera2D>("camera2d")!;
    const camTransform = camArch.get<Transform2D>("transform2d")!;

    camComp.x = camTransform.x;
    camComp.y = camTransform.y;
    camComp.rotation = camTransform.rotation;
    camComp.viewportWidth = this.canvas.width;
    camComp.viewportHeight = this.canvas.height;

    const vp = camComp.getViewProjectionMatrix();

    this.renderer.clear(0.1, 0.1, 0.12);
    this.renderer.begin(vp);

    const sprites = scene.world.query("transform2d", "sprite");
    sprites.sort((a, b) => {
      const za = a.get<Transform2D>("transform2d")!.zIndex;
      const zb = b.get<Transform2D>("transform2d")!.zIndex;
      return za - zb;
    });

    for (const arch of sprites) {
      const transform = arch.get<Transform2D>("transform2d")!;
      const sprite = arch.get<Sprite>("sprite")!;
      this.renderer.drawSprite(transform, sprite);
    }

    this.renderer.end();
  }

  destroy(): void {
    this.stop();
    this.renderer.destroy();
    this.sceneManager.currentScene?.world.clear();
    this.eventBus.clear();
  }
}
