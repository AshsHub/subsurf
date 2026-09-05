import gsap from "gsap";
import { Application } from "pixi.js";
import { ResultOverlay, type ResultOverlayOptions } from "./ResultOverlay";

export class WinOverlay extends ResultOverlay {
  constructor(options: ResultOverlayOptions) {
    super("YOU WIN!", options);

    this._title.style.fill = 0xffd85c;
  }

  public override onEnter(
    app: Application,
    meta?: Record<string, unknown>,
  ): void {
    super.onEnter(app, meta);

    this.alpha = 1;
    this._title.scale.set(0.5);
    this._collections.scale.set(0.5);
    this._continueButton.alpha = 0;
  }

  public override async animateIn(): Promise<void> {
    super.animateIn();

    await Promise.all([
      gsap.to(this._title.scale, {
        x: 1,
        y: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
      }),

      gsap.to(this._collections.scale, {
        x: 1,
        y: 1,
        duration: 0.5,
        delay: 0.1,
        ease: "back.out(1.7)",
      }),

      gsap.to(this._continueButton, {
        alpha: 1,
        duration: 0.3,
        delay: 0.3,
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
