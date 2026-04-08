import { Vec2 } from "./Vec2";
import { Mat3 } from "./Mat3";

export class Transform {
  position: Vec2 = new Vec2();
  rotation: number = 0;
  scale: Vec2 = new Vec2(1, 1);

  get worldMatrix(): Mat3 {
    const t = Mat3.translation(this.position.x, this.position.y);
    const r = Mat3.rotation(this.rotation);
    const s = Mat3.scale(this.scale.x, this.scale.y);
    return t.multiply(r).multiply(s);
  }

  get right(): Vec2 { return Vec2.fromAngle(this.rotation); }
  get up(): Vec2 { return Vec2.fromAngle(this.rotation - Math.PI / 2); }

  clone(): Transform {
    const t = new Transform();
    t.position = this.position.clone();
    t.rotation = this.rotation;
    t.scale = this.scale.clone();
    return t;
  }
}
