import { Component } from "../ecs";

export class UITextInput extends Component {
  readonly type = "uiTextInput";

  public focused: boolean = false;
  public hovered: boolean = false;
  public cursorBlink: number = 0;
  public cursorVisible: boolean = true;

  constructor(
    public width: number = 200,
    public height: number = 32,
    public placeholder: string = "",
    public maxLength: number = 256,
    public bgColorR: number = 0.15,
    public bgColorG: number = 0.15,
    public bgColorB: number = 0.15,
    public bgColorA: number = 1.0,
    public borderColorR: number = 0.4,
    public borderColorG: number = 0.4,
    public borderColorB: number = 0.4,
    public borderColorA: number = 1.0,
    public focusBorderR: number = 0.3,
    public focusBorderG: number = 0.6,
    public focusBorderB: number = 1.0,
    public focusBorderA: number = 1.0,
    public fontSize: number = 14,
    public borderRadius: number = 3,
    public interactive: boolean = true,
  ) {
    super();
  }
}