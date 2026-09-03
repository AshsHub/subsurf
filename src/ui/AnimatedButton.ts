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
  private readonly hoverScale: number;
  private readonly pressedScale: number;
  private readonly animationDuration: number;

  private isHovered = false;
  private isPressed = false;

  protected constructor(options: AnimatedButtonOptions = {}) {
    super();

    this.hoverScale = options.hoverScale ?? 1.04;
    this.pressedScale = options.pressedScale ?? 0.96;
    this.animationDuration = options.animationDuration ?? 0.3;

    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointerenter", (event: FederatedPointerEvent) => {
      this.isHovered = true;

      this.animateScale(this.hoverScale);

      options.onPointerEnter?.(event);
    });

    this.on("pointerleave", (event: FederatedPointerEvent) => {
      this.isHovered = false;
      this.isPressed = false;

      this.animateScale(1);

      options.onPointerLeave?.(event);
    });

    this.on("pointerdown", (event: FederatedPointerEvent) => {
      this.isPressed = true;

      this.animateScale(this.pressedScale);

      options.onPointerDown?.(event);
    });

    this.on("pointerup", (event: FederatedPointerEvent) => {
      this.isPressed = false;

      this.animateScale(this.isHovered ? this.hoverScale : 1);

      options.onPointerUp?.(event);
    });

    this.on("pointerupoutside", () => {
      this.isPressed = false;

      this.animateScale(this.isHovered ? this.hoverScale : 1);
    });

    this.on("pointertap", () => {
      options.onClick?.();
    });
  }

  setEnabled(enabled: boolean): this {
    this.eventMode = enabled ? "static" : "none";
    this.cursor = enabled ? "pointer" : "default";

    this.isHovered = false;
    this.isPressed = false;

    gsap.killTweensOf(this.scale);

    this.scale.set(1);

    return this;
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
