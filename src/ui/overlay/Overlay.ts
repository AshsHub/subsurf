import type { Application, Container } from "pixi.js";

export interface Overlay extends Container {
  onEnter?(app: Application): void | Promise<void>;
  onExit?(): void | Promise<void>;
  onResize?(width: number, height: number): void;

  /**
   * Optional custom entrance animation.
   *
   * If omitted, OverlayManager uses its default fade.
   */
  animateIn?(): void | Promise<void>;

  /**
   * Optional custom exit animation.
   *
   * If omitted, OverlayManager uses its default fade.
   */
  animateOut?(): void | Promise<void>;
}
