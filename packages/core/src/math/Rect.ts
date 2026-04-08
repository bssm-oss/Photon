import { Vec2 } from "./Vec2";

export class Rect {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public width: number = 0,
    public height: number = 0
  ) {}

  get left(): number { return this.x; }
  get right(): number { return this.x + this.width; }
  get top(): number { return this.y; }
  get bottom(): number { return this.y + this.height; }
  get centerX(): number { return this.x + this.width * 0.5; }
  get centerY(): number { return this.y + this.height * 0.5; }

  contains(v: Vec2): boolean {
    return v.x >= this.left && v.x <= this.right &&
           v.y >= this.top && v.y <= this.bottom;
  }

  intersects(other: Rect): boolean {
    return this.left < other.right && this.right > other.left &&
           this.top < other.bottom && this.bottom > other.top;
  }

  clone(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  static fromPoints(a: Vec2, b: Vec2): Rect {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    return new Rect(x, y, Math.max(a.x, b.x) - x, Math.max(a.y, b.y) - y);
  }
}
