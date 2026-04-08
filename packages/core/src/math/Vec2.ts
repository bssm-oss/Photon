export class Vec2 {
  constructor(public x: number = 0, public y: number = 0) {}

  static readonly ZERO = new Vec2(0, 0);
  static readonly ONE = new Vec2(1, 1);
  static readonly UP = new Vec2(0, -1);
  static readonly DOWN = new Vec2(0, 1);
  static readonly LEFT = new Vec2(-1, 0);
  static readonly RIGHT = new Vec2(1, 0);

  clone(): Vec2 { return new Vec2(this.x, this.y); }

  set(x: number, y: number): Vec2 {
    this.x = x;
    this.y = y;
    return this;
  }

  add(v: Vec2): Vec2 { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v: Vec2): Vec2 { return new Vec2(this.x - v.x, this.y - v.y); }
  mul(s: number): Vec2 { return new Vec2(this.x * s, this.y * s); }
  div(s: number): Vec2 { return new Vec2(this.x / s, this.y / s); }

  dot(v: Vec2): number { return this.x * v.x + this.y * v.y; }
  cross(v: Vec2): number { return this.x * v.y - this.y * v.x; }

  length(): number { return Math.sqrt(this.x * this.x + this.y * this.y); }
  lengthSq(): number { return this.x * this.x + this.y * this.y; }

  normalize(): Vec2 {
    const len = this.length();
    return len > 0 ? this.div(len) : Vec2.ZERO.clone();
  }

  distance(v: Vec2): number { return this.sub(v).length(); }
  distanceSq(v: Vec2): number { return this.sub(v).lengthSq(); }

  angle(): number { return Math.atan2(this.y, this.x); }

  rotate(angle: number): Vec2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  lerp(v: Vec2, t: number): Vec2 {
    return new Vec2(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t
    );
  }

  equals(v: Vec2, eps: number = 1e-6): boolean {
    return Math.abs(this.x - v.x) < eps && Math.abs(this.y - v.y) < eps;
  }

  static fromAngle(angle: number, length: number = 1): Vec2 {
    return new Vec2(Math.cos(angle) * length, Math.sin(angle) * length);
  }

  static lerp(a: Vec2, b: Vec2, t: number): Vec2 { return a.lerp(b, t); }
}
