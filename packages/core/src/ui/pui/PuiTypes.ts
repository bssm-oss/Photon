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

export function isPercent(v: PuiValue | undefined): boolean {
  return typeof v === "string" && v.endsWith("%");
}

export function parsePercent(v: PuiValue): number {
  if (typeof v === "string" && v.endsWith("%")) {
    return parseFloat(v.slice(0, -1)) / 100;
  }
  return 0;
}

export interface PuiDocument {
  root: PuiNode;
}
