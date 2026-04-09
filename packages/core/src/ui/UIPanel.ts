import { Component } from "../ecs";

export class UIPanel extends Component {
  readonly type = "uiPanel";

  constructor(
    public width: number = 200,
    public height: number = 200,
    public r: number = 0.1,
    public g: number = 0.1,
    public b: number = 0.12,
    public a: number = 0.9,
    public borderRadius: number = 6,
    public borderR: number = 0.3,
    public borderG: number = 0.3,
    public borderB: number = 0.3,
    public borderA: number = 0.5,
    public borderWidth: number = 1,
  ) {
    super();
  }
}