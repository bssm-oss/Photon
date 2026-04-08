import { Vec2 } from "../math/Vec2";
import { Mat3 } from "../math/Mat3";
import { Rect } from "../math/Rect";
import { Component } from "../ecs";

export class Transform2D extends Component {
  readonly type = "transform2d";
  public x = 0;
  public y = 0;
  public rotation = 0;
  public scaleX = 1;
  public scaleY = 1;
  public zIndex = 0;

  get position(): Vec2 { return new Vec2(this.x, this.y); }
  set position(v: Vec2) { this.x = v.x; this.y = v.y; }

  getLocalMatrix(): Mat3 {
    return Mat3.translation(this.x, this.y)
      .multiply(Mat3.rotation(this.rotation))
      .multiply(Mat3.scale(this.scaleX, this.scaleY));
  }
}

export class Camera2D extends Component {
  readonly type = "camera2d";

  public x = 0;
  public y = 0;
  public zoom = 1;
  public rotation = 0;

  public viewportWidth = 1280;
  public viewportHeight = 720;

  get position(): Vec2 { return new Vec2(this.x, this.y); }
  set position(v: Vec2) { this.x = v.x; this.y = v.y; }

  getViewProjectionMatrix(): Mat3 {
    const halfW = (this.viewportWidth * 0.5) / this.zoom;
    const halfH = (this.viewportHeight * 0.5) / this.zoom;

    const view = Mat3.translation(-this.x, -this.y)
      .multiply(Mat3.rotation(-this.rotation));

    return view.multiply(
      Mat3.orthographic(-halfW, halfW, -halfH, halfH)
    );
  }

  screenToWorld(screenX: number, screenY: number): Vec2 {
    const ndcX = (screenX / this.viewportWidth) * 2 - 1;
    const ndcY = 1 - (screenY / this.viewportHeight) * 2;

    const halfW = (this.viewportWidth * 0.5) / this.zoom;
    const halfH = (this.viewportHeight * 0.5) / this.zoom;

    const vp = this.getViewProjectionMatrix();
    const inv = vp.invert();

    return inv.transformPoint(new Vec2(ndcX * halfW, ndcY * halfH));
  }

  getVisibleBounds(): Rect {
    const halfW = (this.viewportWidth * 0.5) / this.zoom;
    const halfH = (this.viewportHeight * 0.5) / this.zoom;
    return new Rect(
      this.x - halfW,
      this.y - halfH,
      halfW * 2,
      halfH * 2
    );
  }
}
