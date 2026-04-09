import { Component } from "../ecs";

export enum Align {
  Left = "left",
  Center = "center",
  Right = "right",
}

export class UIText extends Component {
  readonly type = "uiText";

  constructor(
    public text: string = "",
    public fontFamily: string = "sans-serif",
    public fontSize: number = 16,
    public colorR: number = 1,
    public colorG: number = 1,
    public colorB: number = 1,
    public colorA: number = 1,
    public align: Align = Align.Left,
    public bold: boolean = false,
    public strokeR: number = 0,
    public strokeG: number = 0,
    public strokeB: number = 0,
    public strokeA: number = 0,
    public strokeWidth: number = 0,
    public padding: number = 4,
  ) {
    super();
  }

  get fontString(): string {
    const parts: string[] = [];
    if (this.bold) parts.push("bold");
    parts.push(`${this.fontSize}px`);
    parts.push(this.fontFamily);
    return parts.join(" ");
  }

  rgba(r: number, g: number, b: number, a: number): string {
    return `rgba(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0},${a})`;
  }
}