import { Container, Graphics, Text } from "pixi.js";
import { TextButton } from "../TextButton";
import type { Overlay } from "./Overlay";

export interface PauseOverlayOptions {
  onResume: () => void;
}

export interface PauseOverlayMeta {}

export class PauseOverlay extends Container implements Overlay {
  private readonly _background: Graphics;
  private readonly _title: Text;
  private readonly _resumeButton: TextButton;

  constructor(options: PauseOverlayOptions) {
    super();

    this._background = new Graphics()
      .beginFill(0x000000, 0.5)
      .drawRect(0, 0, window.innerWidth, window.innerHeight)
      .endFill();

    this._title = new Text("PAUSED", {
      fill: 0xffffff,
      fontFamily: "Bungee Regular",
      fontSize: 48,
      fontWeight: "700",
    });

    this._title.anchor.set(0.5);

    this._resumeButton = new TextButton({
      text: "Resume",
      width: 240,
      height: 72,
      onClick: options.onResume,
    });

    this.addChild(this._background, this._title, this._resumeButton);
  }

  public onResize(width: number, height: number): void {
    this._background.clear();
    this._background
      .beginFill(0x000000, 0.5)
      .drawRect(0, 0, width, height)
      .endFill();

    this._title.position.set(width / 2, height / 2 - 60);
    this._resumeButton.position.set(width / 2, height / 2 + 30);
  }
}
