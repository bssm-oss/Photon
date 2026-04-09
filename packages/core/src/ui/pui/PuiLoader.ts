import { World } from "../../ecs/World";
import { PuiDocument, PuiNode, PuiValue } from "./PuiTypes";
import { UITransform } from "../UITransform";
import { UIPanel } from "../UIPanel";
import { UIButton } from "./../UIButton";
import { UIText, Align } from "../UIText";
import { UITextInput } from "../UITextInput";

type EntityMap = Map<string, number>;

export interface PuiLoadResult {
  entities: EntityMap;
}

export function loadPui(world: World, doc: PuiDocument): PuiLoadResult {
  const entities: EntityMap = new Map();
  buildNode(world, doc.root, entities, 0, 0);
  return { entities };
}

function num(v: PuiValue | undefined, fallback: number): number {
  if (typeof v === "number") return v;
  return fallback;
}

function color(v: PuiValue | undefined, fr: number, fg: number, fb: number, fa: number): [number, number, number, number] {
  if (Array.isArray(v) && v.length === 4) return v as [number, number, number, number];
  return [fr, fg, fb, fa];
}

function str(v: PuiValue | undefined, fallback: string): string {
  if (typeof v === "string") return v;
  return fallback;
}

function bool(v: PuiValue | undefined, fallback: boolean): boolean {
  if (typeof v === "boolean") return v;
  return fallback;
}

function align(v: PuiValue | undefined): Align {
  const s = str(v, "left");
  if (s === "center") return Align.Center;
  if (s === "right") return Align.Right;
  return Align.Left;
}

function buildNode(world: World, node: PuiNode, entities: EntityMap, parentX: number, parentY: number): void {
  const entity = world.createEntity();
  if (node.name) entities.set(node.name, entity.id);

  const p = node.props;

  const tx = new UITransform(
    parentX + num(p.x, 0), parentY + num(p.y, 0),
    num(p.width, 100), num(p.height, 100),
    num(p.originX, 0), num(p.originY, 0),
  );
  tx.zIndex = num(p.zIndex, 0);
  world.addComponent(entity.id, tx);

  switch (node.type) {
    case "panel": {
      const bg = color(p.color, 0.1, 0.1, 0.12, 0.9);
      const bc = color(p.borderColor, 0.3, 0.3, 0.3, 0.5);
      world.addComponent(entity.id, new UIPanel(
        tx.width, tx.height,
        bg[0], bg[1], bg[2], bg[3],
        num(p.borderRadius, 6),
        bc[0], bc[1], bc[2], bc[3],
        num(p.borderWidth, 1),
      ));
      break;
    }

    case "text": {
      const c = color(p.color, 1, 1, 1, 1);
      const sc = color(p.strokeColor, 0, 0, 0, 0);
      world.addComponent(entity.id, new UIText(
        str(p.text, ""),
        str(p.fontFamily, "sans-serif"),
        num(p.fontSize, 16),
        c[0], c[1], c[2], c[3],
        align(p.align),
        bool(p.bold, false),
        sc[0], sc[1], sc[2], sc[3],
        num(p.strokeWidth, 0),
        num(p.padding, 4),
      ));
      break;
    }

    case "button": {
      const c = color(p.color, 0.2, 0.5, 1, 1);
      const hc = color(p.hoverColor, 0.3, 0.6, 1, 1);
      const pc = color(p.pressedColor, 0.1, 0.4, 0.8, 1);
      world.addComponent(entity.id, new UIButton(
        tx.width, tx.height,
        str(p.label, "Button"),
        c[0], c[1], c[2], c[3],
        hc[0], hc[1], hc[2], hc[3],
        pc[0], pc[1], pc[2], pc[3],
        num(p.borderRadius, 4),
        num(p.fontSize, 16),
        bool(p.interactive, true),
      ));
      break;
    }

    case "textInput": {
      const bg = color(p.bgColor, 0.15, 0.15, 0.15, 1);
      const bc = color(p.borderColor, 0.4, 0.4, 0.4, 1);
      const fc = color(p.focusBorderColor, 0.3, 0.6, 1, 1);
      world.addComponent(entity.id, new UITextInput(
        tx.width, tx.height,
        str(p.placeholder, ""),
        num(p.maxLength, 256),
        bg[0], bg[1], bg[2], bg[3],
        bc[0], bc[1], bc[2], bc[3],
        fc[0], fc[1], fc[2], fc[3],
        num(p.fontSize, 14),
        num(p.borderRadius, 3),
        bool(p.interactive, true),
      ));
      const tc = color(p.color, 1, 1, 1, 1);
      world.addComponent(entity.id, new UIText(
        str(p.text, ""),
        str(p.fontFamily, "sans-serif"),
        num(p.fontSize, 14),
        tc[0], tc[1], tc[2], tc[3],
      ));
      break;
    }
  }

  for (const child of node.children) {
    buildNode(world, child, entities, tx.drawX, tx.drawY);
  }
}
