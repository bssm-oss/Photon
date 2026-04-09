export interface PuiNode {
  type: "panel" | "text" | "button" | "textInput";
  name: string;
  props: Record<string, PuiValue>;
  children: PuiNode[];
}

export type PuiValue =
  | string
  | number
  | boolean
  | [number, number, number, number];

export interface PuiDocument {
  root: PuiNode;
}
