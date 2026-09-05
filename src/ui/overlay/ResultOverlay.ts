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

const TITLE_Y = -150;
const COLLECTIONS_Y = -50;
const DISTANCE_Y = 35;
const BUTTON_Y = 125;

export abstract class ResultOverlay extends Container implements Overlay {
  protected readonly _background: IrisRevealBackground;
  protected readonly _title: Text;
  protected readonly _collections: CollectionProgress;
  protected readonly _distance: Text;
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

    this._collections = new CollectionProgress(100);

    this._distance = new Text("0.0", {
      fill: 0xffffff,
      fontFamily: "Bungee Regular",
      fontSize: 28,
      fontWeight: "700",
      align: "center",
    });

    this._distance.anchor.set(0.5);

    this._continueButton = new TextButton({
      text: "Continue",
      width: 240,
      height: 72,
      onClick: options.onContinue,
    });

    this.addChild(
      this._background,
      this._title,
      this._collections,
      this._distance,
      this._continueButton,
    );

    this.eventMode = "static";
  }

  public onEnter(_app: Application, meta?: Record<string, unknown>): void {
    const collections = meta?.collections;
    const collectionTarget = meta?.collectionTarget;
    const distance = meta?.distance;

    if (typeof collectionTarget === "number") {
      this._collections.setTarget(collectionTarget);
    }

    if (typeof collections === "number") {
      this._collections.setValue(collections);
    }

    this._distance.text =
      typeof distance === "number" ? distance.toFixed(1) : "0.0";

    this._background.revealRatio = 1;

    this._title.visible = true;
    this._collections.visible = true;
    this._distance.visible = true;
    this._continueButton.visible = true;
    this._background.visible = true;

    this.visible = true;

    this._title.alpha = 0;
    this._collections.alpha = 0;
    this._distance.alpha = 0;
    this._continueButton.alpha = 0;

    this._title.scale.set(0.8);
    this._collections.scale.set(0.8);
    this._distance.scale.set(0.8);
    this._continueButton.scale.set(0.9);
  }

  public onResize(width: number, height: number): void {
    this._background.onResize(width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    this._title.position.set(centerX, centerY + TITLE_Y);
    this._collections.position.set(centerX, centerY + COLLECTIONS_Y);
    this._distance.position.set(centerX, centerY + DISTANCE_Y);
    this._continueButton.position.set(centerX, centerY + BUTTON_Y);
  }

  public async animateIn(): Promise<void> {
    gsap.killTweensOf([
      this._title,
      this._collections,
      this._distance,
      this._continueButton,
    ]);

    const timeline = gsap.timeline();

    timeline
      .to(this._background, {
        revealRatio: 0,
        duration: 0.6,
        ease: "power3.out",
      })
      .to(
        this._title,
        {
          alpha: 1,
          scale: 1,
          duration: 0.45,
          ease: "back.out(1.7)",
        },
        "-=0.2",
      )
      .to(
        this._collections,
        {
          alpha: 1,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.5)",
        },
        "-=0.2",
      )
      .to(
        this._distance,
        {
          alpha: 1,
          scale: 1,
          duration: 0.35,
          ease: "back.out(1.5)",
        },
        "-=0.2",
      )
      .to(
        this._continueButton,
        {
          alpha: 1,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        "-=0.1",
      );

    await timeline;
  }

  public async animateOut(): Promise<void> {
    gsap.killTweensOf([
      this._title,
      this._collections,
      this._distance,
      this._continueButton,
    ]);

    const timeline = gsap.timeline();

    timeline
      .to(this._continueButton, {
        alpha: 0,
        scale: 0.9,
        duration: 0.2,
        ease: "power2.in",
      })
      .to(
        [this._distance, this._collections],
        {
          alpha: 0,
          scale: 0.9,
          duration: 0.2,
          ease: "power2.in",
        },
        "<",
      )
      .to(
        this._title,
        {
          alpha: 0,
          scale: 0.9,
          duration: 0.2,
          ease: "power2.in",
        },
        "<",
      )
      .to(
        this._background,
        {
          revealRatio: 1,
          duration: 0.6,
          ease: "power3.in",
        },
        "-=0.05",
      );

    await timeline;
  }
}
