import { Scene } from "./Scene";
import { EventBus } from "../event/EventBus";

export class SceneManager {
  private scenes = new Map<string, Scene>();
  private current: Scene | null = null;
  private bus: EventBus;

  constructor(bus?: EventBus) {
    this.bus = bus ?? new EventBus();
  }

  register(scene: Scene): void {
    this.scenes.set(scene.name, scene);
  }

  unregister(name: string): void {
    if (this.current?.name === name) {
      this.current.onExit();
      this.current = null;
    }
    this.scenes.delete(name);
  }

  switchTo(name: string): boolean {
    const scene = this.scenes.get(name);
    if (!scene) return false;

    if (this.current) {
      this.current.onExit();
    }

    this.current = scene;
    this.current.onEnter();
    this.bus.emit("scene:switched", name);

    return true;
  }

  get currentScene(): Scene | null { return this.current; }
  get sceneNames(): string[] { return [...this.scenes.keys()]; }
  get eventBus(): EventBus { return this.bus; }

  getScene(name: string): Scene | undefined {
    return this.scenes.get(name);
  }
}
