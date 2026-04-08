<div align="center">

# ⚡ Photon Engine

**P**erformant, **H**ardware-accelerated, **O**bject, **T**ransform, **O**rientation, **N**etwork

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](#english) · [한국어](#한국어)


</div>

---

<a id="english"></a>

## 📖 Documentation

- [Getting Started](docs/GETTING-STARTED.md) — Setup & first project
- [Architecture](docs/ARCHITECTURE.md) — Engine internals & design
- [Versioning](docs/VERSIONING.md) — Version policy
- [Contributing](docs/CONTRIBUTING.md) — Commit convention & PR guide

## Features

| Feature | Description |
|---------|-------------|
| 🏗️ ECS | Entity-Component-System with Archetype-based queries |
| 🎬 Scene Manager | Scene switching with entity migration between scenes |
| 📷 View System | 2D Camera with zoom, rotation, screen-to-world transform |
| 🎨 WebGL2 Renderer | Batched quad renderer with sprite support |
| 💾 File System | Interface-based FS — inject Browser or custom backend |
| ⌨️ Input | Keyboard + Mouse with pressed/released state tracking |
| 🔌 Plugin Architecture | `INativeBridge` for platform-specific native features |
| 🪶 Lightweight | Zero native dependencies in core — runs in any browser |

## Quick Start

```bash
npm create photon my-game
# or
npm install photon-engine
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
    pos.x = 100; pos.y = 100;
    this.world.addComponent(player.id, pos);
    this.world.addComponent(player.id, new Sprite(1, 0, 0, 1, 32, 32));
  }

  onUpdate(dt: number) {}

  onExit() { this.world.clear(); }
}

const engine = new Engine({ canvasId: "photon-canvas" });
engine.sceneManager.register(new MyScene());
engine.sceneManager.switchTo("my-scene");
engine.start();
```

## Monorepo Structure

```
packages/
├── core/            Main engine (photon-engine)
├── electron/        Electron adapter (photon-engine-electron)
├── browser/         Browser utilities
├── compute/         JS compute backend (@photon-engine/compute)
└── create-photon/   Project scaffolding CLI (create-photon)
```

## Platform Support

| Platform | Package | Status |
|----------|---------|--------|
| Browser | `photon-engine` (core) | ✅ Supported |
| Electron | `photon-engine-electron` | ✅ Supported |

## Platform Adapters

The engine core is **completely platform-independent**. Inject adapters at construction:

```ts
// Browser only
import { Engine } from "photon-engine";
const engine = new Engine({ canvasId: "game-canvas" });

// Electron desktop
import { Engine } from "photon-engine";
import { ElectronNativeBridge } from "photon-engine-electron";
const engine = new Engine({ nativeBridge: new ElectronNativeBridge() });
```

## Testing

```bash
# Unit tests (core)
npm test

# Type check all packages
npm run typecheck
```

## License

MIT

---

<a id="한국어"></a>

## 📖 문서

- [시작하기](docs/GETTING-STARTED.ko.md) — 설치 및 첫 프로젝트
- [아키텍처](docs/ARCHITECTURE.ko.md) — 엔진 내부 구조 및 설계
- [버전 관리](docs/VERSIONING.ko.md) — 버전 정책
- [기여하기](docs/CONTRIBUTING.ko.md) — 커밋 컨벤션 및 PR 가이드

## 특징

| 기능 | 설명 |
|------|------|
| 🏗️ ECS | Archetype 기반 Entity-Component-System |
| 🎬 씬 매니저 | 씬 전환 + 객체를 씬 간 이동 |
| 📷 뷰 시스템 | 줌, 회전, 스크린→월드 변환이 있는 2D 카메라 |
| 🎨 WebGL2 렌더러 | 배치 쿼드 렌더러 + 스프라이트 |
| 💾 파일 시스템 | 인터페이스 기반 — Browser, 커스텀 백엔드 주입 |
| ⌨️ 입력 | 키보드 + 마우스 누름/뗌 상태 추적 |
| 🔌 플러그인 아키텍처 | `INativeBridge`로 플랫폼 고유 기능 연동 |
| 🪶 경량 | 코어에 네이티브 의존성 제로 — 어떤 브라우저에서든 실행 |

## 빠른 시작

```bash
npm create photon my-game
# 또는
npm install photon-engine
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
    pos.x = 100; pos.y = 100;
    this.world.addComponent(player.id, pos);
    this.world.addComponent(player.id, new Sprite(1, 0, 0, 1, 32, 32));
  }

  onUpdate(dt: number) {}

  onExit() { this.world.clear(); }
}

const engine = new Engine({ canvasId: "photon-canvas" });
engine.sceneManager.register(new MyScene());
engine.sceneManager.switchTo("my-scene");
engine.start();
```

## 모노레포 구조

```
packages/
├── core/            메인 엔진 (photon-engine)
├── electron/        Electron 어댑터 (photon-engine-electron)
├── browser/         브라우저 유틸리티
├── compute/         JS 연산 백엔드 (@photon-engine/compute)
└── create-photon/   프로젝트 스캐폴딩 CLI (create-photon)
```

## 플랫폼 지원

| 플랫폼 | 패키지 | 상태 |
|--------|--------|------|
| Browser | `photon-engine` (코어) | ✅ 지원 |
| Electron | `photon-engine-electron` | ✅ 지원 |

## 플랫폼 어댑터

엔진 코어는 **완전히 플랫폼 독립적**입니다. 생성 시 어댑터를 주입하세요:

```ts
// 브라우저
import { Engine } from "photon-engine";
const engine = new Engine({ canvasId: "game-canvas" });

// Electron 데스크탑
import { Engine } from "photon-engine";
import { ElectronNativeBridge } from "photon-engine-electron";
const engine = new Engine({ nativeBridge: new ElectronNativeBridge() });
```

## 테스트

```bash
# 유닛 테스트 (코어)
npm test

# 전체 타입 체크
npm run typecheck
```

## 라이선스

MIT
