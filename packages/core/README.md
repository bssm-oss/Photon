# photon-engine

Lightweight 2D game engine with an Archetype-based ECS architecture, WebGL2 renderer, and platform-independent core.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/bssm-oss/Ion/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/photon-engine)](https://www.npmjs.com/package/photon-engine)

## Install

```bash
npm install photon-engine
```

## Quick Start

```html
<!-- index.html -->
<canvas id="photon-canvas"></canvas>
<script type="module" src="./main.js"></script>
```

```ts
import { Engine, Scene, Transform2D, Camera2D, Sprite } from "photon-engine";

class MyScene extends Scene {
  readonly name = "my-scene";

  onEnter() {
    const cam = this.world.createEntity();
    this.world.addComponent(cam.id, new Transform2D());
    this.world.addComponent(cam.id, new Camera2D());

    const player = this.world.createEntity();
    const pos = new Transform2D();
    pos.x = 100;
    pos.y = 100;
    this.world.addComponent(player.id, pos);
    this.world.addComponent(player.id, new Sprite(1, 0, 0, 1, 32, 32));
  }

  onUpdate(_dt: number) {}

  onExit() {
    this.world.clear();
  }
}

const engine = new Engine({ canvasId: "photon-canvas" });
engine.sceneManager.register(new MyScene());
engine.sceneManager.switchTo("my-scene");
engine.start();
```

## Features

| Module | Description |
|--------|-------------|
| ECS | `World`, `Entity`, `Component`, `System` with Archetype-based queries |
| Scene | `Scene` / `SceneManager` — scene switching with entity migration |
| View | `Camera2D` — zoom, rotation, screen-to-world transform |
| Renderer | `Renderer` — batched WebGL2 quad renderer with sprite support |
| Input | `InputManager` — keyboard & mouse with pressed/released tracking |
| Event | `EventBus` — typed pub/sub event system |
| Math | `Vec2`, `Mat3`, `Rect`, `Transform` |
| FileSystem | `IFileSystem` / `BrowserFileSystem` — injectable FS interface |
| Bridge | `INativeBridge` / `NullNativeBridge` — platform adapter interface |

## Platform Adapters

The core has zero native dependencies and runs in any browser. Inject adapters at construction:

```ts
// Browser (default)
const engine = new Engine({ canvasId: "photon-canvas" });

// Electron desktop
import { ElectronNativeBridge } from "photon-engine-electron";
const engine = new Engine({ nativeBridge: new ElectronNativeBridge() });
```

## API

### `Engine`

```ts
new Engine(config?: EngineConfig)

interface EngineConfig {
  canvasId?: string;     // default: "photon-canvas"
  width?: number;
  height?: number;
  fs?: IFileSystem;
  nativeBridge?: INativeBridge;
}

engine.start()
engine.stop()
engine.destroy()
engine.sceneManager  // SceneManager
engine.renderer      // Renderer
engine.input         // InputManager
engine.eventBus      // EventBus
engine.fs            // IFileSystem
```

### ECS

```ts
const world = new World();
const entity = world.createEntity();
world.addComponent(entity.id, new Transform2D());
const results = world.query("transform2d", "sprite"); // Archetype[]
world.removeEntity(entity.id);
world.clear();
```

## Repository

[https://github.com/bssm-oss/Ion](https://github.com/bssm-oss/Ion)

## License

MIT
