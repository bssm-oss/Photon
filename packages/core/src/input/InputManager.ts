import { Vec2 } from "../math/Vec2";
import { InputCaptureStack, InputPriority } from "./InputCaptureStack";

export { InputPriority, InputCaptureStack };

export class InputManager {
  private keysDown = new Set<string>();
  private keysPressed = new Set<string>();
  private keysReleased = new Set<string>();
  private mouseButtonsDown = new Set<number>();
  private mouseButtonsPressed = new Set<number>();
  private mouseButtonsReleased = new Set<number>();
  private mousePos = new Vec2();
  private mouseDelta = new Vec2();
  private scrollDelta = 0;

  private bound = false;
  private captureStack = new InputCaptureStack();

  private keyDownHandler: (e: KeyboardEvent) => void;
  private keyUpHandler: (e: KeyboardEvent) => void;
  private mouseMoveHandler: (e: MouseEvent) => void;
  private mouseDownHandler: (e: MouseEvent) => void;
  private mouseUpHandler: (e: MouseEvent) => void;
  private wheelHandler: (e: WheelEvent) => void;

  constructor(private canvas: HTMLCanvasElement) {
    this.keyDownHandler = (e) => {
      if (this.captureStack.isCaptured()) return;
      if (!this.keysDown.has(e.code)) this.keysPressed.add(e.code);
      this.keysDown.add(e.code);
      e.preventDefault();
    };
    this.keyUpHandler = (e) => {
      if (this.captureStack.isCaptured()) return;
      this.keysDown.delete(e.code);
      this.keysReleased.add(e.code);
    };
    this.mouseMoveHandler = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      this.mouseDelta = new Vec2(nx - this.mousePos.x, ny - this.mousePos.y);
      this.mousePos = new Vec2(nx, ny);
    };
    this.mouseDownHandler = (e) => {
      if (this.captureStack.isCaptured()) return;
      if (!this.mouseButtonsDown.has(e.button)) this.mouseButtonsPressed.add(e.button);
      this.mouseButtonsDown.add(e.button);
    };
    this.mouseUpHandler = (e) => {
      if (this.captureStack.isCaptured()) return;
      this.mouseButtonsDown.delete(e.button);
      this.mouseButtonsReleased.add(e.button);
    };
    this.wheelHandler = (e) => {
      if (this.captureStack.isCaptured()) return;
      this.scrollDelta = e.deltaY;
    };
  }

  capture(holderId: string, priority: InputPriority = InputPriority.UI): boolean {
    return this.captureStack.request(holderId, priority);
  }

  release(holderId: string): void {
    this.captureStack.release(holderId);
  }

  hasOwnership(holderId: string): boolean {
    return this.captureStack.hasOwnership(holderId);
  }

  isCaptured(): boolean {
    return this.captureStack.isCaptured();
  }

  getCurrentHolder(): string | null {
    return this.captureStack.getCurrentHolder();
  }

  init(): void {
    if (this.bound) return;
    this.bound = true;
    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("wheel", this.wheelHandler);
  }

  destroy(): void {
    if (!this.bound) return;
    this.bound = false;
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("wheel", this.wheelHandler);
    this.captureStack.clear();
  }

  endFrame(): void {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mouseButtonsPressed.clear();
    this.mouseButtonsReleased.clear();
    this.mouseDelta = Vec2.ZERO.clone();
    this.scrollDelta = 0;
  }

  isKeyDown(code: string): boolean {
    if (this.captureStack.isCaptured()) return false;
    return this.keysDown.has(code);
  }

  isKeyPressed(code: string): boolean {
    if (this.captureStack.isCaptured()) return false;
    return this.keysPressed.has(code);
  }

  isKeyReleased(code: string): boolean {
    if (this.captureStack.isCaptured()) return false;
    return this.keysReleased.has(code);
  }

  isMouseButtonDown(btn: number = 0): boolean {
    if (this.captureStack.isCaptured()) return false;
    return this.mouseButtonsDown.has(btn);
  }

  isMouseButtonPressed(btn: number = 0): boolean {
    if (this.captureStack.isCaptured()) return false;
    return this.mouseButtonsPressed.has(btn);
  }

  isMouseButtonReleased(btn: number = 0): boolean {
    if (this.captureStack.isCaptured()) return false;
    return this.mouseButtonsReleased.has(btn);
  }

  get mousePosition(): Vec2 { return this.mousePos.clone(); }
  get mouseDeltaPosition(): Vec2 { return this.mouseDelta.clone(); }
  get scrollY(): number {
    if (this.captureStack.isCaptured()) return 0;
    return this.scrollDelta;
  }
}