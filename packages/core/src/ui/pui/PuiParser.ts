import { PuiDocument, PuiNode, PuiValue } from "./PuiTypes";

const COLOR_KEYS = new Set([
  "color", "hoverColor", "pressedColor", "focusedColor",
  "bgColor", "borderColor", "focusBorderColor",
  "strokeColor",
]);

const SIZE_KEYS = new Set([
  "width", "height", "fontSize", "borderRadius", "padding",
  "maxWidth", "maxLength", "strokeWidth", "borderWidth", "zIndex",
]);

const POS_KEYS = new Set([
  "x", "y", "originX", "originY",
]);

function isValueLine(line: string): boolean {
  return line.includes(":") && !line.endsWith(":");
}

function indentLevel(line: string): number {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

export function parsePui(source: string): PuiDocument {
  const lines = source.split("\n").map((l) => l.replace(/\s+$/, "")).filter((l) => l.length > 0 && !l.startsWith("//"));

  let i = 0;
  function parseNode(indent: number): PuiNode {
    const line = lines[i];
    const trimmed = line.trim();

    const match = trimmed.match(/^(\w+)\s+"([^"]*)"\s*\{$/) ||
                  trimmed.match(/^(\w+)\s+'([^']*)'\s*\{$/) ||
                  trimmed.match(/^(\w+)\s+(\S+)\s*\{$/) ||
                  trimmed.match(/^(\w+)\s*\{$/);

    if (!match) {
      throw new PuiSyntaxError(i + 1, `Expected node declaration, got: ${trimmed}`);
    }

    const type = match[1] as PuiNode["type"];
    const name = match[2] ?? "";
    i++;

    const props: Record<string, PuiValue> = {};
    const children: PuiNode[] = [];

    while (i < lines.length) {
      const nextLine = lines[i];
      const nextIndent = indentLevel(nextLine);
      const nextTrimmed = nextLine.trim();

      if (nextIndent < indent) break;

      if (nextTrimmed === "}") {
        i++;
        break;
      }

      if (isValueLine(nextTrimmed)) {
        // Support multiple props on one line separated by semicolons: `x: 20; y: 10;`
        const parts = nextTrimmed.split(";").map((s) => s.trim()).filter((s) => s.includes(":"));
        for (const part of parts) {
          const colonIdx = part.indexOf(":");
          const key = part.slice(0, colonIdx).trim();
          const rawVal = part.slice(colonIdx + 1).trim();
          if (key && rawVal) props[key] = parseValue(key, rawVal, i + 1);
        }
        i++;
      } else {
        children.push(parseNode(nextIndent));
      }
    }

    return { type, name, props, children };
  }

  const root = parseNode(0);
  return { root };
}

function parseValue(key: string, raw: string, line: number): PuiValue {
  if (raw === "true") return true;
  if (raw === "false") return false;

  if (raw.startsWith("[") && raw.endsWith("]")) {
    const parts = raw.slice(1, -1).split(",").map((s) => s.trim());
    if (parts.length === 4 && parts.every((p) => !isNaN(Number(p)))) {
      return parts.map(Number) as [number, number, number, number];
    }
    throw new PuiSyntaxError(line, `Invalid color array for "${key}": ${raw}`);
  }

  if (SIZE_KEYS.has(key) || POS_KEYS.has(key)) {
    const num = Number(raw);
    if (isNaN(num)) throw new PuiSyntaxError(line, `Expected number for "${key}", got: ${raw}`);
    return num;
  }

  if (raw.startsWith('"') && raw.endsWith('"')) return raw.slice(1, -1);
  if (raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1);

  return raw;
}

export class PuiSyntaxError extends Error {
  constructor(public line: number, message: string) {
    super(`.pui syntax error (line ${line}): ${message}`);
    this.name = "PuiSyntaxError";
  }
}
