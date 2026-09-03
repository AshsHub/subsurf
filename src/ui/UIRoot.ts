import { Container } from "pixi.js";

export class UIRoot extends Container {
  onResize(width: number, height: number) {
    for (const child of this.children) {
      const resizeable = child as {
        onResize?: (width: number, height: number) => void;
      };

      resizeable.onResize?.(width, height);
    }
  }
}
