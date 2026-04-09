import { Component } from "../ecs";

export class UIButton extends Component {
  readonly type = "uiButton";

  public hovered: boolean = false;
  public pressed: boolean = false;
  public focused: boolean = false;

  constructor(
    public width: number = 100,
    public height: number = 40,
    public label: string = "Button",
    public r: number = 0.2,
    public g: number = 0.5,
    public b: number = 1.0,
    public a: number = 1.0,
    public hoverR: number = 0.3,
    public hoverG: number = 0.6,
    public hoverB: number = 1.0,
    public hoverA: number = 1.0,
    public pressedR: number = 0.1,
    public pressedG: number = 0.4,
    public pressedB: number = 0.8,
    public pressedA: number = 1.0,
    public borderRadius: number = 4,
    public fontSize: number = 16,
    public interactive: boolean = true,
  ) {
    super();
  }
}