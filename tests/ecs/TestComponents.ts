import { describe, it, expect } from "vitest";
import { Component } from "@engine/ecs/Component";

class Position extends Component {
  readonly type = "position";
  constructor(public x: number = 0, public y: number = 0) { super(); }
}

class Velocity extends Component {
  readonly type = "velocity";
  constructor(public dx: number = 0, public dy: number = 0) { super(); }
}

class Health extends Component {
  readonly type = "health";
  constructor(public hp: number = 100) { super(); }
}

export { Position, Velocity, Health };
