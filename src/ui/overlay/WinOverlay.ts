import gsap from "gsap";
import { Application } from "pixi.js";
import {
  ResultOverlay,
  type ResultOverlayMeta,
  type ResultOverlayOptions,
} from "./ResultOverlay";

export class WinOverlay extends ResultOverlay {
  constructor(options: ResultOverlayOptions) {
    super("YOU WIN!", options);

    this._title.style.fill = 0xe8b52f;
  }

  public override onEnter(app: Application, meta?: ResultOverlayMeta): void {
    super.onEnter(app, meta);

    this._continueButton.setEnabled(false);
  }

  protected async _playResultAnimation(): Promise<void> {
    await gsap.to(this._title, {
      alpha: 1,
      duration: 0.5,
      ease: "power1.inOut",
    });

    this._character.celebrate().play();

    gsap.delayedCall(0.45, () => {
      this._continueButton.setEnabled(true);
    });
  }
}
