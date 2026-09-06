import gsap from "gsap";
import { Application } from "pixi.js";
import {
  ResultOverlay,
  type ResultOverlayMeta,
  type ResultOverlayOptions,
} from "./ResultOverlay";

export class LoseOverlay extends ResultOverlay {
  constructor(options: ResultOverlayOptions) {
    super("GAME OVER", options);
    this._title.style.fill = 0xff6b6b;
  }

  public override onEnter(app: Application, meta?: ResultOverlayMeta): void {
    super.onEnter(app, meta);

    this._continueButton.setEnabled(false);
  }

  protected async _playResultAnimation(): Promise<void> {
    await this._character.defeat().play();

    await gsap.to(this._title, {
      alpha: 1,
      duration: 0.5,
      ease: "power1.inOut",
    });

    await this._character.fallOver().play();

    gsap.delayedCall(0.45, () => {
      this._continueButton.setEnabled(true);
    });
  }
}
