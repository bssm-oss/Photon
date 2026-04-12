import { Component } from "../ecs";

export interface UIPercent {
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
}

export const NO_PCT: UIPercent = { xPct: -1, yPct: -1, widthPct: -1, heightPct: -1 };

export class UITransform extends Component {
  readonly type = "uiTransform";

  public zIndex: number = 0;
  public pct: UIPercent = { ...NO_PCT };

  private _baseX: number = 0;
  private _baseY: number = 0;
  private _baseWidth: number = 100;
  private _baseHeight: number = 100;

  constructor(
    x: number = 0,
    y: number = 0,
    width: number = 100,
    height: number = 100,
    public originX: number = 0,
    public originY: number = 0,
  ) {
    super();
    this._baseX = x;
    this._baseY = y;
    this._baseWidth = width;
    this._baseHeight = height;
  }

  set x(v: number) { this._baseX = v; }
  get x(): number { return this._baseX; }

  set y(v: number) { this._baseY = v; }
  get y(): number { return this._baseY; }

  set width(v: number) { this._baseWidth = v; }
  get width(): number { return this._baseWidth; }

  set height(v: number) { this._baseHeight = v; }
  get height(): number { return this._baseHeight; }

  resolve(canvasW: number, canvasH: number): void {
    const hasPct = this.pct.xPct >= 0 || this.pct.yPct >= 0 || this.pct.widthPct >= 0 || this.pct.heightPct >= 0;
    if (!hasPct) return;

    if (this.pct.xPct >= 0) this._baseX = this.pct.xPct * canvasW;
    if (this.pct.yPct >= 0) this._baseY = this.pct.yPct * canvasH;
    if (this.pct.widthPct >= 0) this._baseWidth = this.pct.widthPct * canvasW;
    if (this.pct.heightPct >= 0) this._baseHeight = this.pct.heightPct * canvasH;
  }

  get drawX(): number {
    return this._baseX - this._baseWidth * this.originX;
  }

  get drawY(): number {
    return this._baseY - this._baseHeight * this.originY;
  }

  containsPoint(px: number, py: number): boolean {
    const dx = this.drawX;
    const dy = this.drawY;
    return px >= dx && px <= dx + this._baseWidth && py >= dy && py <= dy + this._baseHeight;
  }
}
