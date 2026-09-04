import { Container, Graphics, Text } from "pixi.js";
import { TextButton } from "../TextButton";

export interface PauseOverlayOptions {
  onResume: () => void;
}

export class PauseOverlay extends Container {
  private readonly background: Graphics;

  constructor(options: PauseOverlayOptions) {
    super();

    this.background = new Graphics()
      .beginFill(0x000000, 0.5)
      .drawRect(0, 0, window.innerWidth, window.innerHeight)
      .endFill();

    const title = new Text("PAUSED", {
      fill: 0xffffff,
      fontFamily: "Bungee Regular",
      fontSize: 48,
      fontWeight: "700",
    });

    title.anchor.set(0.5);

    const resumeButton = new TextButton({
      text: "Resume",
      width: 240,
      height: 72,
      onClick: options.onResume,
    });

    this.addChild(this.background, title, resumeButton);

    this._layout(title, resumeButton);

    window.addEventListener("resize", this._onResize);
  }

  private _layout(title: Text, resumeButton: TextButton): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.background.clear();
    this.background
      .beginFill(0x000000, 0.5)
      .drawRect(0, 0, width, height)
      .endFill();

    title.position.set(width / 2, height / 2 - 60);

    resumeButton.position.set(width / 2, height / 2 + 30);
  }

  private readonly _onResize = (): void => {
    const title = this.children[1] as Text;
    const resumeButton = this.children[2] as TextButton;

    this._layout(title, resumeButton);
  };

  override destroy(): void {
    window.removeEventListener("resize", this._onResize);

    super.destroy();
  }
}
