import { System } from "../ecs/System";
import { World } from "../ecs/World";
import { Archetype } from "../ecs/Archetype";
import { UITransform } from "./UITransform";
import { UIButton } from "./UIButton";
import { UIText, Align } from "./UIText";
import { UITextInput } from "./UITextInput";
import { UIPanel } from "./UIPanel";
import { EventBus } from "../event/EventBus";
import { InputPriority } from "../input/InputManager";
import type { Engine } from "../core/Engine";

function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0},${a})`;
}

export class UIRenderSystem extends System {
  readonly requiredComponents = ["uiTransform"];

  private overlay!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private engine!: Engine;
  private bus!: EventBus;

  private focusedId: number | null = null;
  private hoveredId: number | null = null;

  private hiddenTextarea!: HTMLTextAreaElement;
  private textareaEntityId: number | null = null;

  private _onMouseMove!: (e: MouseEvent) => void;
  private _onMouseDown!: (e: MouseEvent) => void;
  private _onMouseUp!: (e: MouseEvent) => void;
  private _onKeyDown!: (e: KeyboardEvent) => void;
  private _onResize!: () => void;
  private _onInput!: () => void;
  private _onBlur!: () => void;
  private _onCompositionStart!: () => void;
  private _onCompositionEnd!: (e: CompositionEvent) => void;

  private logicalW = 0;
  private logicalH = 0;

  onInit(world: World): void {
    if (!world.scene?.engine) {
      throw new Error("UIRenderSystem requires scene registered via engine.sceneManager.register()");
    }
    this.engine = world.scene.engine;
    this.bus = world.eventBus;

    this.setupOverlay();
    this.setupHiddenTextarea();

    this._onMouseMove = (e: MouseEvent) => {
      const r = this.engine.canvas.getBoundingClientRect();
      this.handleMouseMove(e.clientX - r.left, e.clientY - r.top);
    };
    this._onMouseDown = (e: MouseEvent) => {
      const r = this.engine.canvas.getBoundingClientRect();
      this.handleMouseDown(e.clientX - r.left, e.clientY - r.top, e.button);
      // Prevent the browser from blurring the hidden textarea when clicking the canvas
      e.preventDefault();
    };
    this._onMouseUp = (e: MouseEvent) => {
      const r = this.engine.canvas.getBoundingClientRect();
      this.handleMouseUp(e.clientX - r.left, e.clientY - r.top, e.button);
    };
    this._onResize = () => this.syncSize();
    this._onKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);

    this.engine.canvas.addEventListener("mousemove", this._onMouseMove);
    this.engine.canvas.addEventListener("mousedown", this._onMouseDown);
    this.engine.canvas.addEventListener("mouseup", this._onMouseUp);
    window.addEventListener("resize", this._onResize);
    window.addEventListener("keydown", this._onKeyDown);
  }

  private setupOverlay(): void {
    this.overlay = document.createElement("canvas");
    this.overlay.style.cssText =
      "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;";
    this.engine.canvas.style.position = "relative";

    const parent = this.engine.canvas.parentElement;
    if (parent) parent.style.position = "relative";
    parent?.appendChild(this.overlay);

    this.ctx = this.overlay.getContext("2d")!;
    this.syncSize();
  }

  private syncSize(): void {
    const dpr = this.engine.pixelRatio;
    const rect = this.engine.canvas.getBoundingClientRect();
    this.logicalW = rect.width;
    this.logicalH = rect.height;
    this.overlay.width = Math.round(this.logicalW * dpr);
    this.overlay.height = Math.round(this.logicalH * dpr);
    this.overlay.style.width = this.logicalW + "px";
    this.overlay.style.height = this.logicalH + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private setupHiddenTextarea(): void {
    this.hiddenTextarea = document.createElement("textarea");
    this.hiddenTextarea.style.cssText =
      "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.01;border:none;outline:none;padding:0;margin:0;";
    this.hiddenTextarea.setAttribute("autocomplete", "off");
    this.hiddenTextarea.setAttribute("autocorrect", "off");
    this.hiddenTextarea.setAttribute("autocapitalize", "off");
    this.hiddenTextarea.setAttribute("spellcheck", "false");
    this.hiddenTextarea.setAttribute("tabindex", "-1");
    document.body.appendChild(this.hiddenTextarea);

    this._onInput = () => this.handleTextareaInput();
    this._onBlur = () => this.blurFocusedInput();
    this._onCompositionStart = () => { this.isComposing = true; };
    this._onCompositionEnd = (e: CompositionEvent) => this.handleCompositionEnd(e);

    this.hiddenTextarea.addEventListener("input", this._onInput);
    this.hiddenTextarea.addEventListener("blur", this._onBlur);
    this.hiddenTextarea.addEventListener("compositionstart", this._onCompositionStart);
    this.hiddenTextarea.addEventListener("compositionend", this._onCompositionEnd);
  }

  private isComposing = false;
  private holderId: string;

  constructor() {
    super();
    this.holderId = `ui-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private focusInput(entityId: number): void {
    this.focusedId = entityId;
    this.textareaEntityId = entityId;
    this.isComposing = false;

    const scene = this.engine.sceneManager.currentScene;
    if (scene) {
      const arch = scene.world.getArchetype(entityId);
      const txt = arch?.get<UIText>("uiText");
      this.hiddenTextarea.value = txt?.text ?? "";
    } else {
      this.hiddenTextarea.value = "";
    }

    this.engine.input.capture(this.holderId, InputPriority.UI);
    this.hiddenTextarea.focus();
    this.bus.emit("ui:focus", entityId);
  }

  private blurFocusedInput(): void {
    if (this.textareaEntityId !== null) {
      const scene = this.engine.sceneManager.currentScene;
      if (scene) {
        const arch = scene.world.getArchetype(this.textareaEntityId);
        const inp = arch?.get<UITextInput>("uiTextInput");
        if (inp) inp.focused = false;
      }
      this.bus.emit("ui:blur", this.textareaEntityId);
    }
    this.engine.input.release(this.holderId);
    this.textareaEntityId = null;
    this.focusedId = null;
    this.isComposing = false;
    this.hiddenTextarea.blur();
  }

  private handleTextareaInput(): void {
    if (this.textareaEntityId === null) return;

    const scene = this.engine.sceneManager.currentScene;
    if (!scene) return;

    const arch = scene.world.getArchetype(this.textareaEntityId);
    if (!arch) return;

    const input = arch.get<UITextInput>("uiTextInput");
    const txt = arch.get<UIText>("uiText");
    if (!input || !txt) return;

    const prev = txt.text;
    txt.text = this.hiddenTextarea.value.slice(0, input.maxLength);
    if (txt.text !== prev) {
      this.bus.emit("ui:change", { entityId: this.textareaEntityId, value: txt.text });
    }
  }

  private handleCompositionEnd(_e: CompositionEvent): void {
    this.isComposing = false;
    this.handleTextareaInput();
  }

  private handleMouseMove(mx: number, my: number): void {
    const scene = this.engine.sceneManager.currentScene;
    if (!scene) return;

    let found: number | null = null;

    const all = scene.world.query("uiTransform");
    for (let i = all.length - 1; i >= 0; i--) {
      const arch = all[i];
      const ui = arch.get<UITransform>("uiTransform");
      const btn = arch.get<UIButton>("uiButton");
      const input = arch.get<UITextInput>("uiTextInput");

      const interactive = (btn?.interactive ?? false) || (input?.interactive ?? false);
      if (!interactive) continue;

      if (ui?.containsPoint(mx, my)) {
        found = arch.entity.id;
        break;
      }
    }

    if (this.hoveredId !== null && this.hoveredId !== found) {
      const prev = scene.world.getArchetype(this.hoveredId);
      if (prev) {
        const pb = prev.get<UIButton>("uiButton");
        const pi = prev.get<UITextInput>("uiTextInput");
        if (pb) pb.hovered = false;
        if (pi) pi.hovered = false;
      }
    }

    if (found !== null) {
      const arch = scene.world.getArchetype(found);
      if (arch) {
        const btn = arch.get<UIButton>("uiButton");
        const inp = arch.get<UITextInput>("uiTextInput");
        if (btn) btn.hovered = true;
        if (inp) inp.hovered = true;
      }
      this.engine.canvas.style.cursor = "pointer";
    } else {
      this.engine.canvas.style.cursor = "default";
    }
    this.hoveredId = found;
  }

  private handleMouseDown(mx: number, my: number, button: number): void {
    if (button !== 0) return;
    const scene = this.engine.sceneManager.currentScene;
    if (!scene) return;

    const all = scene.world.query("uiTransform");
    let hitSomething = false;

    for (let i = all.length - 1; i >= 0; i--) {
      const arch = all[i];
      const ui = arch.get<UITransform>("uiTransform");
      if (!ui?.containsPoint(mx, my)) continue;

      hitSomething = true;
      const btn = arch.get<UIButton>("uiButton");
      const input = arch.get<UITextInput>("uiTextInput");

      if (btn?.interactive) {
        btn.pressed = true;
        btn.focused = true;
      }

      if (input?.interactive) {
        this.focusInput(arch.entity.id);
        input.focused = true;
      } else if (this.textareaEntityId !== null) {
        this.blurFocusedInput();
      }

      this.focusedId = arch.entity.id;
      break;
    }

    if (!hitSomething && this.textareaEntityId !== null) {
      this.blurFocusedInput();
    }
  }

  private handleMouseUp(mx: number, my: number, button: number): void {
    if (button !== 0) return;
    const scene = this.engine.sceneManager.currentScene;
    if (!scene) return;

    const all = scene.world.query("uiTransform");
    for (const arch of all) {
      const btn = arch.get<UIButton>("uiButton");
      const ui = arch.get<UITransform>("uiTransform");
      if (!btn || !ui) continue;

      if (btn.pressed && ui.containsPoint(mx, my)) {
        this.bus.emit("ui:click", arch.entity.id);
      }
      btn.pressed = false;
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.textareaEntityId === null) return;
    if (e.code === "Escape") {
      this.blurFocusedInput();
      e.preventDefault();
    }
  }

  onUpdate(_world: World, archetypes: Archetype[], dt: number): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.logicalW, this.logicalH);

    archetypes.sort((a, b) => {
      const za = a.get<UITransform>("uiTransform")?.zIndex ?? 0;
      const zb = b.get<UITransform>("uiTransform")?.zIndex ?? 0;
      return za - zb;
    });

    for (const arch of archetypes) {
      const ui = arch.get<UITransform>("uiTransform");
      if (!ui) continue;

      const panel = arch.get<UIPanel>("uiPanel");
      const btn = arch.get<UIButton>("uiButton");
      const input = arch.get<UITextInput>("uiTextInput");
      const txt = arch.get<UIText>("uiText");

      if (panel) this.drawPanel(ctx, ui, panel);
      if (btn) this.drawButton(ctx, ui, btn);
      if (input) this.drawTextInput(ctx, ui, input, txt, dt);
      if (txt && !btn && !input) this.drawText(ctx, ui, txt, 0, 0, ui.width, ui.height);
    }
  }

  private drawPanel(ctx: CanvasRenderingContext2D, ui: UITransform, p: UIPanel): void {
    const x = ui.drawX, y = ui.drawY, w = p.width, h = p.height;
    ctx.fillStyle = rgba(p.r, p.g, p.b, p.a);
    ctx.beginPath();
    this.roundRect(ctx, x, y, w, h, p.borderRadius);
    ctx.fill();

    if (p.borderWidth > 0) {
      ctx.strokeStyle = rgba(p.borderR, p.borderG, p.borderB, p.borderA);
      ctx.lineWidth = p.borderWidth;
      ctx.stroke();
    }
  }

  private drawButton(ctx: CanvasRenderingContext2D, ui: UITransform, btn: UIButton): void {
    const x = ui.drawX, y = ui.drawY;
    let r = btn.r, g = btn.g, b = btn.b, a = btn.a;
    if (btn.pressed) { r = btn.pressedR; g = btn.pressedG; b = btn.pressedB; a = btn.pressedA; }
    else if (btn.hovered) { r = btn.hoverR; g = btn.hoverG; b = btn.hoverB; a = btn.hoverA; }

    ctx.fillStyle = rgba(r, g, b, a);
    ctx.beginPath();
    this.roundRect(ctx, x, y, btn.width, btn.height, btn.borderRadius);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, btn.width, btn.height);
    ctx.clip();

    ctx.font = `${btn.fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = rgba(1, 1, 1, 1);
    ctx.fillText(btn.label, x + btn.width / 2, y + btn.height / 2);

    ctx.restore();

    if (btn.focused) {
      ctx.strokeStyle = rgba(1, 1, 1, 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.roundRect(ctx, x, y, btn.width, btn.height, btn.borderRadius);
      ctx.stroke();
    }
  }

  private drawTextInput(
    ctx: CanvasRenderingContext2D,
    ui: UITransform,
    input: UITextInput,
    txt: UIText | undefined,
    dt: number,
  ): void {
    const x = ui.drawX, y = ui.drawY;

    ctx.fillStyle = rgba(input.bgColorR, input.bgColorG, input.bgColorB, input.bgColorA);
    ctx.beginPath();
    this.roundRect(ctx, x, y, input.width, input.height, input.borderRadius);
    ctx.fill();

    if (input.focused) {
      ctx.strokeStyle = rgba(input.focusBorderR, input.focusBorderG, input.focusBorderB, input.focusBorderA);
    } else if (input.hovered) {
      ctx.strokeStyle = rgba(0.6, 0.6, 0.6, 1);
    } else {
      ctx.strokeStyle = rgba(input.borderColorR, input.borderColorG, input.borderColorB, input.borderColorA);
    }
    ctx.lineWidth = 1;
    ctx.stroke();

    const displayText = txt?.text ?? "";
    const pad = 6;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, input.width, input.height);
    ctx.clip();

    ctx.font = `${input.fontSize}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    if (displayText.length > 0) {
      ctx.fillStyle = txt ? rgba(txt.colorR, txt.colorG, txt.colorB, txt.colorA) : rgba(1, 1, 1, 1);
      ctx.fillText(displayText, x + pad, y + input.height / 2);
    } else if (input.placeholder.length > 0) {
      ctx.fillStyle = rgba(0.5, 0.5, 0.5, 1);
      ctx.fillText(input.placeholder, x + pad, y + input.height / 2);
    }

    if (input.focused) {
      input.cursorBlink += dt;
      if (input.cursorBlink > 1.0) input.cursorBlink -= 1.0;
      input.cursorVisible = input.cursorBlink < 0.5;

      if (input.cursorVisible) {
        const textW = ctx.measureText(displayText).width;
        const cx = x + pad + textW + 1;
        ctx.fillStyle = rgba(1, 1, 1, 1);
        ctx.fillRect(cx, y + 6, 1, input.height - 12);
      }
    }

    ctx.restore();
  }

  private drawText(
    ctx: CanvasRenderingContext2D,
    ui: UITransform,
    txt: UIText,
    ox: number,
    oy: number,
    w: number,
    h: number,
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(ui.drawX + ox, ui.drawY + oy, w, h);
    ctx.clip();

    ctx.font = txt.fontString;

    let align: CanvasTextAlign = "left";
    let textX = ui.drawX + ox + txt.padding;
    if (txt.align === Align.Center) { align = "center"; textX = ui.drawX + ox + w / 2; }
    else if (txt.align === Align.Right) { align = "right"; textX = ui.drawX + ox + w - txt.padding; }
    ctx.textAlign = align;
    ctx.textBaseline = "top";

    const textY = ui.drawY + oy + txt.padding;

    if (txt.strokeWidth > 0) {
      ctx.strokeStyle = rgba(txt.strokeR, txt.strokeG, txt.strokeB, txt.strokeA);
      ctx.lineWidth = txt.strokeWidth;
      ctx.strokeText(txt.text, textX, textY);
    }

    ctx.fillStyle = rgba(txt.colorR, txt.colorG, txt.colorB, txt.colorA);
    ctx.fillText(txt.text, textX, textY);

    ctx.restore();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  onDestroy(_world: World): void {
    this.blurFocusedInput();
    this.engine.input.release(this.holderId);
    this.engine.canvas.removeEventListener("mousemove", this._onMouseMove);
    this.engine.canvas.removeEventListener("mousedown", this._onMouseDown);
    this.engine.canvas.removeEventListener("mouseup", this._onMouseUp);
    window.removeEventListener("resize", this._onResize);
    this.hiddenTextarea.removeEventListener("input", this._onInput);
    this.hiddenTextarea.removeEventListener("blur", this._onBlur);
    this.hiddenTextarea.removeEventListener("compositionstart", this._onCompositionStart);
    this.hiddenTextarea.removeEventListener("compositionend", this._onCompositionEnd);
    window.removeEventListener("keydown", this._onKeyDown);
    this.hiddenTextarea.remove();
    this.overlay.remove();
  }
}