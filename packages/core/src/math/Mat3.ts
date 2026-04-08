import { Vec2 } from "./Vec2";

export class Mat3 {
  constructor(public data: Float32Array = Mat3.identity().data) {}

  static identity(): Mat3 {
    return new Mat3(new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ]));
  }

  static translation(x: number, y: number): Mat3 {
    const m = Mat3.identity();
    m.data[6] = x;
    m.data[7] = y;
    return m;
  }

  static rotation(rad: number): Mat3 {
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const m = Mat3.identity();
    m.data[0] = cos;
    m.data[1] = sin;
    m.data[3] = -sin;
    m.data[4] = cos;
    return m;
  }

  static scale(sx: number, sy: number): Mat3 {
    const m = Mat3.identity();
    m.data[0] = sx;
    m.data[4] = sy;
    return m;
  }

  static orthographic(left: number, right: number, bottom: number, top: number): Mat3 {
    const m = Mat3.identity();
    m.data[0] = 2 / (right - left);
    m.data[4] = 2 / (top - bottom);
    m.data[6] = -(right + left) / (right - left);
    m.data[7] = -(top + bottom) / (top - bottom);
    return m;
  }

  multiply(other: Mat3): Mat3 {
    const a = this.data;
    const b = other.data;
    const r = new Float32Array(9);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        r[j * 3 + i] =
          a[i] * b[j * 3] +
          a[3 + i] * b[j * 3 + 1] +
          a[6 + i] * b[j * 3 + 2];
      }
    }
    return new Mat3(r);
  }

  transformPoint(v: Vec2): Vec2 {
    const d = this.data;
    return new Vec2(
      d[0] * v.x + d[3] * v.y + d[6],
      d[1] * v.x + d[4] * v.y + d[7]
    );
  }

  clone(): Mat3 { return new Mat3(new Float32Array(this.data)); }

  invert(): Mat3 {
    const d = this.data;
    const det =
      d[0] * (d[4] * d[8] - d[5] * d[7]) -
      d[1] * (d[3] * d[8] - d[5] * d[6]) +
      d[2] * (d[3] * d[7] - d[4] * d[6]);

    if (Math.abs(det) < 1e-10) return Mat3.identity();

    const invDet = 1 / det;
    const r = new Float32Array(9);
    r[0] = (d[4] * d[8] - d[5] * d[7]) * invDet;
    r[1] = (d[2] * d[7] - d[1] * d[8]) * invDet;
    r[2] = (d[1] * d[5] - d[2] * d[4]) * invDet;
    r[3] = (d[5] * d[6] - d[3] * d[8]) * invDet;
    r[4] = (d[0] * d[8] - d[2] * d[6]) * invDet;
    r[5] = (d[2] * d[3] - d[0] * d[5]) * invDet;
    r[6] = (d[3] * d[7] - d[4] * d[6]) * invDet;
    r[7] = (d[1] * d[6] - d[0] * d[7]) * invDet;
    r[8] = (d[0] * d[4] - d[1] * d[3]) * invDet;
    return new Mat3(r);
  }
}
