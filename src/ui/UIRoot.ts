import { Container } from "pixi.js";

export interface Resizable {
  onResize(width: number, height: number): void;
}

export class UIRoot extends Container {
  public onResize(width: number, height: number): void {
    debugger;
    for (const child of this.children) {
      (child as Partial<Resizable>).onResize?.(width, height);
    }
  }
}
