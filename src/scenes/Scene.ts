import type { Application, Container } from "pixi.js";

export interface SceneTransitionOptions {
  immediate?: boolean;
}

export interface Scene extends Container {
  onEnter?(app: Application): void | Promise<void>;
  onExit?(): void | Promise<void>;
  onResize?(width: number, height: number): void;
}
