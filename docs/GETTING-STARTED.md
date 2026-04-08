# Getting Started

## Prerequisites

- Node.js >= 18
- npm >= 9

## Installation

```bash
# Scaffold a new project
npm create ion my-game

# Or install the engine directly
npm install ion-engine
```

## First Project

### 1. Create a canvas

```html
<canvas id="ion-canvas"></canvas>
```

### 2. Write your first scene

```ts
import { Engine, Scene, Transform2D, Camera2D, Sprite } from "ion-engine";

class GameScene extends Scene {
  readonly name = "game";

  onEnter(): void {
    const cam = this.world.createEntity();
    this.world.addComponent(cam.id, new Transform2D());
    this.world.addComponent(cam.id, new Camera2D());

    const player = this.world.createEntity();
    const pos = new Transform2D();
    pos.x = 100;
    pos.y = 100;
    this.world.addComponent(player.id, pos);
    this.world.addComponent(player.id, new Sprite(1, 0.5, 0.2, 1, 32, 32));
  }

  onUpdate(dt: number): void {}

  onExit(): void {
    this.world.clear();
  }
}
```

### 3. Start the engine

```ts
const engine = new Engine({ canvasId: "ion-canvas" });
engine.sceneManager.register(new GameScene());
engine.sceneManager.switchTo("game");
engine.start();
```

## Custom Components

```ts
import { Component } from "ion-engine";

class Velocity extends Component {
  readonly type = "velocity";
  constructor(public dx: number = 0, public dy: number = 0) { super(); }
}

class Health extends Component {
  readonly type = "health";
  constructor(public hp: number = 100, public max: number = 100) { super(); }
}
```

## Custom Systems

```ts
import { System, World, Archetype } from "ion-engine";

class MovementSystem extends System {
  readonly requiredComponents = ["transform2d", "velocity"];
  priority = 100;

  onInit(world: World): void {}

  onUpdate(world: World, archetypes: Archetype[], dt: number): void {
    for (const arch of archetypes) {
      const t = arch.get<Transform2D>("transform2d")!;
      const v = arch.get<Velocity>("velocity")!;
      t.x += v.dx * dt;
      t.y += v.dy * dt;
    }
  }

  onDestroy(world: World): void {}
}

// Register in scene:
this.world.registerSystem(new MovementSystem());
```

## Scene Transitions with Entity Migration

```ts
class Level1 extends Scene {
  readonly name = "level1";

  onEnter(): void { /* ... */ }

  onUpdate(dt: number): void {
    if (playerReachedGoal) {
      this.moveEntityTo(playerId, level2Scene);
      sceneManager.switchTo("level2");
    }
  }

  onExit(): void { this.world.clear(); }
}
```

## File System

```ts
// Write
await engine.fs.writeText("saves/slot1.json", JSON.stringify(saveData));

// Read
const data = await engine.fs.readText("saves/slot1.json");

// List directory
const files = await engine.fs.listDir("saves");
```

## Electron Desktop Build

```bash
npm create ion my-game -- --electron
cd my-game
npm install
npm run electron:dev
```

## Development (monorepo)

```bash
# Build all packages
npm run build

# Unit tests
npm test

# Type checking
npm run typecheck

# Lint
npm run lint
```
