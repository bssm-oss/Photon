import { Component } from "../ecs";

export class UITransform extends Component {
  readonly type = "uiTransform";

  public zIndex: number = 0;

  constructor(
    public x: number = 0,
    public y: number = 0,
    public width: number = 100,
    public height: number = 100,
    public originX: number = 0,
    public originY: number = 0,
  ) {
    super();
  }

  get drawX(): number {
    return this.x - this.width * this.originX;
  }

  get drawY(): number {
    return this.y - this.height * this.originY;
  }

  containsPoint(px: number, py: number): boolean {
    const dx = this.drawX;
    const dy = this.drawY;
    return px >= dx && px <= dx + this.width && py >= dy && py <= dy + this.height;
  }
}