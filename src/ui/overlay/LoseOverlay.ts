import gsap from "gsap";
import { Application } from "pixi.js";
import { ResultOverlay, type ResultOverlayOptions } from "./ResultOverlay";

export class LoseOverlay extends ResultOverlay {
  constructor(options: ResultOverlayOptions) {
    super("GAME OVER", options);
    this._title.style.fill = 0xff6b6b;
  }

  public override onEnter(
    app: Application,
    meta?: Record<string, unknown>,
  ): void {
    super.onEnter(app, meta);

    this.alpha = 1;
    this._title.scale.set(1.2);
    this._score.alpha = 0;
    this._continueButton.alpha = 0;
  }

  public override async animateIn(): Promise<void> {
    super.animateIn();
    await gsap.to(this._title.scale, {
      x: 1,
      y: 1,
      duration: 0.35,
      ease: "power2.out",
    });

    await Promise.all([
      gsap.to(this._score, {
        alpha: 1,
        duration: 0.3,
      }),

      gsap.to(this._continueButton, {
        alpha: 1,
        duration: 0.3,
        delay: 0.15,
      }),
    ]);
  }

  public override async animateOut(): Promise<void> {
    await super.animateOut();
    await gsap.to(this, {
      alpha: 0,
      duration: 0.25,
      ease: "power2.in",
    });
  }
}
