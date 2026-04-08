# 아키텍처

## 개요

Ion Engine은 ECS 아키텍처 기반의 **플랫폼 독립적인** 2D 게임 엔진입니다. 코어 패키지(`ion-engine`)는 플랫폼 의존성이 전혀 없으며 — 모든 플랫폼 고유 기능은 인터페이스를 통해 주입됩니다.

```
┌─────────────────────────────────────────────────┐
│                  게임 코드                        │
│          (씬, 컴포넌트, 시스템)                    │
├─────────────────────────────────────────────────┤
│            ion-engine (코어)                      │
│  ┌──────┐ ┌───────┐ ┌──────┐ ┌───────────────┐  │
│  │ ECS  │ │ Scene │ │ View │ │   Renderer    │  │
│  │World │ │ Mgr   │ │/Cam  │ │  (WebGL2)     │  │
│  └──────┘ └───────┘ └──────┘ └───────────────┘  │
│  ┌──────┐ ┌───────┐ ┌──────┐ ┌───────────────┐  │
│  │Input │ │ Event │ │ Math │ │  Filesystem   │  │
│  │ Mgr  │ │  Bus  │ │Utils │ │  (인터페이스)  │  │
│  └──────┘ └───────┘ └──────┘ └───────────────┘  │
├─────────────┬─────────────────────────────────┤
│  인터페이스  │  INativeBridge · IFileSystem    │
│             │  IComputeBackend                │
├─────────────┼──────────┬──────────────────────┤
│   브라우저   │ Electron │     커스텀            │
│  (내장)     │ 어댑터   │   (직접 구현)         │
└─────────────┴──────────┴──────────────────────┘
```

## ECS (Entity-Component-System)

### Entity
선택적 태그가 있는 가벼운 ID 홀더. 엔티티는 **독립적** — 어떤 계층에도 속하지 않습니다.

### Component
`Component`를 상속하는 순수 데이터 컨테이너. 각각 쿼리용 고유 `type` 문자열을 가집니다.

### System
`requiredComponents`에 매칭되는 아키타입을 쿼리하는 로직 프로세서. `priority` 순서로 실행됩니다.

### World
엔티티와 시스템의 컨테이너. 아키타입 기반 조회를 위한 `query()` 제공.

### Archetype
단일 엔티티에 컴포넌트를 매핑. Entity와 Component 데이터 사이의 다리.

## 씬 시스템

씬은 `World`를 소유하며 다음을 지원:
- **`switchTo(name)`** — 씬 활성화, 현재 씬 비활성화
- **`moveEntityTo(entityId, targetScene)`** — 엔티티(모든 컴포넌트 포함)를 씬 간 이동
- **`copyEntityTo(entityId, targetScene)`** — 엔티티를 다른 씬에 복제

이를 통해 **객체 독립성**이 보장됩니다 — 엔티티는 씬 간 자유롭게 이동할 수 있습니다.

## 뷰 시스템

`Camera2D` 제공:
- 설정 가능한 줌이 있는 직교 투영
- 회전 지원
- `screenToWorld()` 좌표 변환
- 프러스텀 컬링용 `getVisibleBounds()`

## 렌더러

WebGL2 배치 쿼드 렌더러:
- 쿼드를 단일 버텍스 버퍼에 수집
- 텍스처 변경 또는 버퍼 가득 참 시 플러시
- `Transform2D`의 `zIndex`로 Z-정렬

## 파일 시스템

**인터페이스 기반 설계:**

```ts
interface IFileSystem {
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
  readBinary(path: string): Promise<Uint8Array>;
  writeBinary(path: string, data: Uint8Array): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  remove(path: string): Promise<void>;
  listDir(path: string): Promise<string[]>;
}
```

구현체:
- `BrowserFileSystem` — 메모리 + localStorage 지속성
- `ElectronFileSystem` — Electron IPC를 통한 디스크 접근

## 네이티브 브릿지

`INativeBridge`는 플랫폼 고유 작업의 게이트웨이:

```ts
interface INativeBridge {
  readonly fs: IFileSystem;
  invoke(command: string, args?: Record<string, unknown>): Promise<unknown>;
}
```

플랫폼 구현체:
- `NullNativeBridge` — 브라우저 전용 no-op
- `ElectronNativeBridge` — IPC로 Electron 메인 프로세스에 위임

`IComputeBackend`는 고부하 연산을 위임:

| 메서드 | 설명 |
|--------|------|
| `collideAABB()` | AABB 충돌 감지 |
| `batchTransform()` | 배치 행렬 곱셈 |
| `noise2D()` | Perlin/Simplex 노이즈 생성 |
| `pathfind()` | 그리드 기반 A* 길찾기 |

`NoopCompute`가 모든 메서드에 JS 폴백을 제공합니다.

## 이벤트 시스템

`EventBus`는 결합도가 낮은 통신을 제공:
- `on()` / `off()` — 구독/구독 해지
- `once()` — 첫 호출 후 자동 구독 해지
- `emit()` — 모든 리스너에게 이벤트 발생

엔진 이벤트: `engine:start`, `engine:stop`, `engine:resize`, `scene:switched`, `entity:created`, `entity:destroyed`, `component:added`, `component:removed`.

## 게임 루프

```
┌─── requestAnimationFrame ───┐
│                              │
│  rawDt = now - lastTime      │
│  dt = min(rawDt, 250ms)      │
│                              │
│  fixedAccumulator += dt      │
│  while (acc >= fixedStep) {  │
│    world.update(dt)          │ ← 고정 60Hz
│    scene.onUpdate(dt)        │
│    acc -= fixedStep          │
│  }                           │
│                              │
│  render()                    │ ← 매 프레임
│  input.endFrame()            │
└──────────────────────────────┘
```

물리/로직은 60Hz 고정 타임스텝, 렌더링은 가변 프레임레이트로 부드러운 시각을 제공합니다.
