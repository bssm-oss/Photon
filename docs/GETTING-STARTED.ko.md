# 시작하기

## 사전 요구사항

- Node.js >= 18
- npm >= 9

## 설치

```bash
# 새 프로젝트 스캐폴딩
npm create ion my-game

# 또는 엔진 직접 설치
npm install ion-engine
```

## 첫 프로젝트

### 1. 캔버스 만들기

```html
<canvas id="ion-canvas"></canvas>
```

### 2. 첫 씬 작성

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

### 3. 엔진 시작

```ts
const engine = new Engine({ canvasId: "ion-canvas" });
engine.sceneManager.register(new GameScene());
engine.sceneManager.switchTo("game");
engine.start();
```

## 커스텀 컴포넌트

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

## 커스텀 시스템

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

// 씬에서 등록:
this.world.registerSystem(new MovementSystem());
```

## 씬 전환 + 엔티티 이동

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

## 파일 시스템

```ts
// 쓰기
await engine.fs.writeText("saves/slot1.json", JSON.stringify(saveData));

// 읽기
const data = await engine.fs.readText("saves/slot1.json");

// 디렉토리 목록
const files = await engine.fs.listDir("saves");
```

## Electron 데스크탑 빌드

```bash
npm create ion my-game -- --electron
cd my-game
npm install
npm run electron:dev
```

## 개발 (모노레포)

```bash
# 전체 빌드
npm run build

# 유닛 테스트
npm test

# 타입 체크
npm run typecheck

# 린트
npm run lint
```
