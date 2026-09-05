import gsap from "gsap";
import { Application, Container, Text } from "pixi.js";
import { CollectionProgress } from "../CollectionProgress";
import { TextButton } from "../TextButton";
import { IrisRevealBackground } from "./IrisRevealBackground";
import type { Overlay } from "./Overlay";

export interface ResultOverlayOptions {
  onContinue: () => void;
}

const BACKGROUND_COLOR = 0xf9edf2;

export abstract class ResultOverlay extends Container implements Overlay {
  protected readonly _background: IrisRevealBackground;
  protected readonly _title: Text;
  protected readonly _score: CollectionProgress;
  protected readonly _continueButton: TextButton;

  constructor(titleText: string, options: ResultOverlayOptions) {
    super();

    this._background = new IrisRevealBackground(BACKGROUND_COLOR);

    this._title = new Text(titleText, {
      fill: 0xffffff,
      fontFamily: "Bungee Regular",
      fontSize: 64,
      fontWeight: "700",
    });

    this._title.anchor.set(0.5);

    this._score = new CollectionProgress(100);

    this._continueButton = new TextButton({
      text: "Continue",
      width: 240,
      height: 72,
      onClick: options.onContinue,
    });

    this.addChild(
      this._background,
      this._title,
      this._score,
      this._continueButton,
    );

    this.eventMode = "static";
  }

  public onEnter(_app: Application, meta?: Record<string, unknown>): void {
    const score = meta?.score;
    const target = meta?.target;

    if (typeof target === "number") {
      this._score.setTarget(target);
    }

    if (typeof score === "number") {
      this._score.setValue(score);
    }

    this._background.revealRatio = 1;
    this._background.visible = true;

    this._title.visible = true;
    this._score.visible = true;
    this._continueButton.visible = true;

    this.visible = true;
  }

  public onResize(width: number, height: number): void {
    this._background.onResize(width, height);

    this._title.position.set(width / 2, height / 2 - 130);
    this._score.position.set(width / 2, height / 2 - 40);
    this._continueButton.position.set(width / 2, height / 2 + 70);
  }

  public async animateIn(): Promise<void> {
    await gsap.to(this._background, {
      revealRatio: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  }

  public async animateOut(): Promise<void> {
    await gsap.to(this._background, {
      revealRatio: 1,
      duration: 0.6,
      ease: "power3.in",
    });
  }
}
