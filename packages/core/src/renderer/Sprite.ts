import { Component } from "../ecs";

export class Sprite extends Component {
  readonly type = "sprite";

  constructor(
    public colorR: number = 1,
    public colorG: number = 1,
    public colorB: number = 1,
    public colorA: number = 1,
    public width: number = 32,
    public height: number = 32,
    public texture?: WebGLTexture,
    public texCoordU: number = 0,
    public texCoordV: number = 0,
    public texCoordW: number = 1,
    public texCoordH: number = 1
  ) {
    super();
  }
}
