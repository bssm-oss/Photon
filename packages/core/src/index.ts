export { Engine, type EngineConfig } from "./core/Engine";
export { type INativeBridge, type IComputeBackend, NoopCompute, NullNativeBridge } from "./core/INativeBridge";

export { World, System, Entity, Archetype, Component, type IComponent, type ComponentType, type ComponentMap } from "./ecs";
export { Scene, SceneManager } from "./scene";
export { Transform2D, Camera2D } from "./view";
export { Renderer, Shader, Sprite, Texture } from "./renderer";
export { type IFileSystem, BrowserFileSystem } from "./filesystem";
export { InputManager } from "./input";
export { EventBus, globalBus } from "./event";
export { Vec2, Mat3, Rect, Transform } from "./math";
