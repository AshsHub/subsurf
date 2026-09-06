import { Container, type FederatedPointerEvent } from "pixi.js";
import { gsap } from "gsap";

export interface AnimatedButtonOptions {
  onClick?: () => void;
  onPointerDown?: (event: FederatedPointerEvent) => void;
  onPointerUp?: (event: FederatedPointerEvent) => void;
  onPointerEnter?: (event: FederatedPointerEvent) => void;
  onPointerLeave?: (event: FederatedPointerEvent) => void;

  hoverScale?: number;
  pressedScale?: number;
  animationDuration?: number;
}

export abstract class AnimatedButton extends Container {
  private static readonly DISABLED_ALPHA = 0.5;

  private readonly hoverScale: number;
  private readonly pressedScale: number;
  private readonly animationDuration: number;

  private isHovered = false;
  private isPressed = false;
  private _enabled = true;

  protected constructor(options: AnimatedButtonOptions = {}) {
    super();

    this.hoverScale = options.hoverScale ?? 1.04;
    this.pressedScale = options.pressedScale ?? 0.96;
    this.animationDuration = options.animationDuration ?? 0.3;

    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointerenter", (event: FederatedPointerEvent) => {
      if (!this._enabled) {
        return;
      }

      this.isHovered = true;

      this.animateScale(this.hoverScale);

      options.onPointerEnter?.(event);
    });

    this.on("pointerleave", (event: FederatedPointerEvent) => {
      if (!this._enabled) {
        return;
      }

      this.isHovered = false;
      this.isPressed = false;

      this.animateScale(1);

      options.onPointerLeave?.(event);
    });

    this.on("pointerdown", (event: FederatedPointerEvent) => {
      if (!this._enabled) {
        return;
      }

      this.isPressed = true;

      this.animateScale(this.pressedScale);

      options.onPointerDown?.(event);
    });

    this.on("pointerup", (event: FederatedPointerEvent) => {
      if (!this._enabled) {
        return;
      }

      this.isPressed = false;

      this.animateScale(this.isHovered ? this.hoverScale : 1);

      options.onPointerUp?.(event);
    });

    this.on("pointerupoutside", () => {
      if (!this._enabled) {
        return;
      }

      this.isPressed = false;

      this.animateScale(this.isHovered ? this.hoverScale : 1);
    });

    this.on("pointertap", () => {
      if (!this._enabled) {
        return;
      }

      options.onClick?.();
    });
  }

  public setEnabled(enabled: boolean): this {
    if (this._enabled === enabled) {
      return this;
    }

    this._enabled = enabled;

    this.eventMode = enabled ? "static" : "none";
    this.cursor = enabled ? "pointer" : "default";

    this.isHovered = false;
    this.isPressed = false;

    gsap.killTweensOf(this.scale);
    this.scale.set(1);

    gsap.to(this, {
      alpha: enabled ? 1 : AnimatedButton.DISABLED_ALPHA,
      duration: 0.15,
      ease: "power2.out",
      overwrite: true,
    });

    return this;
  }

  public get enabled(): boolean {
    return this._enabled;
  }

  private animateScale(scale: number): void {
    gsap.to(this.scale, {
      x: scale,
      y: scale,
      duration: this.animationDuration,
      ease: "ease.out(1, 0.5)",
      overwrite: true,
    });
  }
}
