# Architecture

## Overview

Ion Engine is a **platform-independent** 2D game engine built on ECS architecture. The core package (`ion-engine`) contains zero platform dependencies — all platform-specific functionality is injected via interfaces.

```
┌─────────────────────────────────────────────────┐
│                  Your Game                       │
│          (Scenes, Components, Systems)           │
├─────────────────────────────────────────────────┤
│               ion-engine (core)                  │
│  ┌──────┐ ┌───────┐ ┌──────┐ ┌───────────────┐  │
│  │ ECS  │ │ Scene │ │ View │ │   Renderer    │  │
│  │World │ │ Mgr   │ │/Cam  │ │  (WebGL2)     │  │
│  └──────┘ └───────┘ └──────┘ └───────────────┘  │
│  ┌──────┐ ┌───────┐ ┌──────┐ ┌───────────────┐  │
│  │Input │ │ Event │ │ Math │ │  Filesystem   │  │
│  │ Mgr  │ │  Bus  │ │Utils │ │  (Interface)  │  │
│  └──────┘ └───────┘ └──────┘ └───────────────┘  │
├─────────────┬─────────────────────────────────┤
│  Interfaces │  INativeBridge · IFileSystem    │
│             │  IComputeBackend                │
├─────────────┼──────────┬──────────────────────┤
│   Browser   │ Electron │     Custom           │
│  (built-in) │ adapter  │   (your impl)        │
└─────────────┴──────────┴──────────────────────┘
```

## ECS (Entity-Component-System)

### Entity
A lightweight ID holder with optional tags. Entities are **independent** — they don't belong to any hierarchy.

### Component
Pure data containers extending `Component`. Each has a unique `type` string for queries.

### System
Logic processors that query archetypes matching `requiredComponents`. Systems run in `priority` order.

### World
Container for entities and systems. Provides `query()` for archetype-based lookups.

### Archetype
Maps components to a single entity. The bridge between Entity and Component data.

## Scene System

Scenes own a `World` and support:
- **`switchTo(name)`** — activate a scene, deactivating the current one
- **`moveEntityTo(entityId, targetScene)`** — transfer an entity (with all components) between scenes
- **`copyEntityTo(entityId, targetScene)`** — duplicate an entity into another scene

This enables **object independence** — entities can freely migrate across scenes.

## View System

`Camera2D` provides:
- Orthographic projection with configurable zoom
- Rotation support
- `screenToWorld()` coordinate conversion
- `getVisibleBounds()` for frustum culling

## Renderer

WebGL2 batched quad renderer:
- Collects quads into a single vertex buffer
- Flushes on texture change or buffer full
- Z-sorting via `zIndex` on `Transform2D`

## File System

**Interface-based design:**

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

Implementations:
- `BrowserFileSystem` — in-memory + localStorage persistence
- `ElectronFileSystem` — disk access via Electron IPC

## Native Bridge

`INativeBridge` is the gateway for platform-specific operations:

```ts
interface INativeBridge {
  readonly fs: IFileSystem;
  invoke(command: string, args?: Record<string, unknown>): Promise<unknown>;
}
```

Platform implementations:
- `NullNativeBridge` — no-op for browser-only use
- `ElectronNativeBridge` — delegates to Electron main process via IPC

`IComputeBackend` delegates heavy computation:

| Method | Description |
|--------|-------------|
| `collideAABB()` | Axis-aligned bounding box collision |
| `batchTransform()` | Batch matrix multiplication |
| `noise2D()` | Perlin/simplex noise generation |
| `pathfind()` | A* pathfinding on a grid |

`NoopCompute` provides JS fallback implementations for all methods.

## Event System

`EventBus` provides decoupled communication:
- `on()` / `off()` — subscribe/unsubscribe
- `once()` — auto-unsubscribe after first call
- `emit()` — fire event to all listeners

Engine events: `engine:start`, `engine:stop`, `engine:resize`, `scene:switched`, `entity:created`, `entity:destroyed`, `component:added`, `component:removed`.

## Game Loop

```
┌─── requestAnimationFrame ───┐
│                              │
│  rawDt = now - lastTime      │
│  dt = min(rawDt, 250ms)      │
│                              │
│  fixedAccumulator += dt      │
│  while (acc >= fixedStep) {  │
│    world.update(dt)          │ ← fixed 60Hz
│    scene.onUpdate(dt)        │
│    acc -= fixedStep          │
│  }                           │
│                              │
│  render()                    │ ← every frame
│  input.endFrame()            │
└──────────────────────────────┘
```

Fixed timestep at 60Hz for physics/logic, variable render rate for smooth visuals.
