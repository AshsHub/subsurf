import type { Application, Container } from "pixi.js";

export interface Overlay<TMeta = any> extends Container {
  onEnter?(app: Application, meta?: TMeta): void | Promise<void>;

  onExit?(): void | Promise<void>;

  onResize?(width: number, height: number): void;

  animateIn?(): void | Promise<void>;

  animateOut?(): void | Promise<void>;
}
