import { Container } from "pixi.js";
import type { Application } from "pixi.js";
import type { Scene } from "./Scene";

export class GameScene extends Container implements Scene {
  onEnter(_app: Application) {
    // Initialise gameplay.
  }

  onResize(_width: number, _height: number) {
    // Resize gameplay UI/world if required.
  }
}
