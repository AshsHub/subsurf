import { Container } from "pixi.js";
import { TextButton } from "./TextButton";

export class GameUI extends Container {
  private readonly pauseButton: TextButton;

  constructor(onPause: () => void) {
    super();

    this.pauseButton = new TextButton({
      text: "Pause",
      width: 120,
      height: 48,
      onClick: onPause,
    });

    this.addChild(this.pauseButton);

    this.resize(window.innerWidth, window.innerHeight);
  }

  public show(): void {
    this.visible = true;
    this.eventMode = "static";
    this.pauseButton.setEnabled(true);
  }

  public hide(): void {
    this.visible = false;
    this.eventMode = "none";
    this.pauseButton.setEnabled(false);
  }

  public resize(width: number, _height: number): void {
    this.pauseButton.position.set(
      width - this.pauseButton.width,
      this.pauseButton.height,
    );
  }
}
