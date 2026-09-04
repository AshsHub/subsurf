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

    this.pauseButton.position.set(24, 24);

    this.addChild(this.pauseButton);
  }

  resize(width: number, height: number): void {
    // Reserved for future screen-relative UI.
  }
}
