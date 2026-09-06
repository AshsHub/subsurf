import gsap from "gsap";
import { Application, Container, Text } from "pixi.js";
import { Character } from "../Character";
import { CollectionProgress } from "../CollectionProgress";
import { TextButton } from "../TextButton";
import { IrisRevealBackground } from "./IrisRevealBackground";
import type { Overlay } from "./Overlay";
import { DistanceStat } from "../DistanceStat";

export interface ResultOverlayOptions {
  onContinue: () => void;
}

export interface ResultOverlayMeta {
  collections: number;
  collectionTarget: number;
  distance: number;
}

export abstract class ResultOverlay
  extends Container
  implements Overlay<ResultOverlayMeta>
{
  private static readonly CONFIG = {
    background: {
      color: 0xf9edf2,
    },

    layout: {
      designWidth: 600,
      designHeight: 800,

      minScale: 0.7,
      maxScale: 1,

      titleY: -185,
      characterY: -70,
      distanceY: 100,
      collectionsY: -10,
      buttonY: 195,
    },

    title: {
      fontSize: 64,
    },

    character: {
      scale: 1.5,
      enterScale: 1.25,
    },

    collections: {
      target: 10,
      displayScale: 1.5,
      incrementDelay: 0.025,
    },

    button: {
      width: 240,
      height: 72,
    },

    animation: {
      revealDuration: 0.6,
      fadeDuration: 0.6,
      buttonDuration: 0.25,
      delay: 0.5,
      ease: "power3.out",
    },
  } as const;

  protected readonly _background: IrisRevealBackground;
  protected readonly _contentContainer = new Container();
  protected readonly _title: Text;
  protected readonly _character: Character;
  protected readonly _collections: CollectionProgress;
  protected readonly _distanceStat: DistanceStat;
  protected _collectionValue = 0;
  protected _distanceTraveled = 0;
  protected readonly _continueButton: TextButton;

  constructor(titleText: string, options: ResultOverlayOptions) {
    super();

    const config = ResultOverlay.CONFIG;

    this._background = new IrisRevealBackground(config.background.color);

    this._title = new Text(titleText, {
      fill: 0xffffff,
      fontFamily: "Bungee Regular",
      fontSize: config.title.fontSize,
      fontWeight: "700",
      stroke: "0xffffff",
      strokeThickness: 5,
    });

    this._title.anchor.set(0.5);

    this._character = new Character();
    this._character.scale.set(config.character.scale);

    this._collections = new CollectionProgress({
      target: config.collections.target,
      displayScale: config.collections.displayScale,
    });

    this._distanceStat = new DistanceStat();

    this._continueButton = new TextButton({
      text: "Play Again",
      width: config.button.width,
      height: config.button.height,
      onClick: options.onContinue,
    });

    this.addChild(this._background, this._contentContainer);

    this._contentContainer.addChild(
      this._title,
      this._character,
      this._collections,
      this._distanceStat,
      this._continueButton,
    );

    this.eventMode = "static";
  }

  // TODO: fix typing
  public onEnter(_app: Application, meta?: ResultOverlayMeta): void {
    const config = ResultOverlay.CONFIG;

    this._collectionValue = meta?.collections ?? 0;

    const collectionTarget = meta?.collectionTarget;

    this._distanceTraveled = meta?.distance ?? 0;

    if (typeof collectionTarget === "number") {
      this._collections.setTarget(collectionTarget);
    }

    this._distanceStat.set(0);
    this._distanceStat.alpha = 0;

    this._background.revealRatio = 1;

    this.visible = true;
    this.alpha = 1;

    this._contentContainer.alpha = 1;
    this._collections.alpha = 0;
    this._continueButton.alpha = 0;

    this._character.reset();
    this._character.scale.set(config.character.enterScale);
  }

  public onResize(width: number, height: number): void {
    this._background.onResize(width, height);

    const config = ResultOverlay.CONFIG;
    const layout = config.layout;

    const centerX = width / 2;
    const centerY = height / 2;

    const scale = Math.max(
      layout.minScale,
      Math.min(
        layout.maxScale,
        Math.min(width / layout.designWidth, height / layout.designHeight),
      ),
    );

    this._contentContainer.scale.set(scale);

    this._title.position.set(centerX / scale, centerY / scale + layout.titleY);

    this._character.position.set(
      centerX / scale,
      centerY / scale + layout.characterY,
    );

    this._collections.position.set(
      centerX / scale - this._collections.width / 2,
      centerY / scale + layout.collectionsY,
    );

    this._distanceStat.position.set(
      centerX / scale,
      centerY / scale + layout.distanceY,
    );

    this._continueButton.position.set(
      centerX / scale,
      centerY / scale + layout.buttonY,
    );
  }

  public async animateIn(): Promise<void> {
    const config = ResultOverlay.CONFIG;
    const animation = config.animation;

    this.killTweens();

    this._title.alpha = 0;
    this._character.alpha = 0;
    this._contentContainer.alpha = 1;

    await gsap.to(this._background, {
      revealRatio: 0,
      duration: animation.revealDuration,
      ease: animation.ease,
    });

    gsap.to(this._character, {
      alpha: 1,
      duration: animation.fadeDuration,
      ease: animation.ease,
    });

    await gsap.to(this._collections, {
      alpha: 1,
      ease: animation.ease,
      delay: animation.delay,
    });

    await this._collections.animateTo(
      this._collectionValue,
      config.collections.incrementDelay,
    );

    await this._playResultAnimation();

    await gsap.to(this._distanceStat, {
      alpha: 1,
      ease: animation.ease,
      delay: animation.delay,
    });

    await this._distanceStat.animateTo(this._distanceTraveled);

    gsap.to(this._continueButton, {
      alpha: 1,
      duration: animation.buttonDuration,
      delay: animation.delay,
      ease: animation.ease,
    });
  }

  protected abstract _playResultAnimation(): Promise<void>;

  public async animateOut(): Promise<void> {
    const config = ResultOverlay.CONFIG;
    const animation = config.animation;

    this.killTweens();

    await gsap.to(this._contentContainer, {
      alpha: 0,
      duration: animation.fadeDuration,
      ease: animation.ease,
    });

    this._character.reset();

    await gsap.to(this._background, {
      revealRatio: 1,
      duration: animation.revealDuration,
      ease: animation.ease,
    });
  }

  public killTweens(): void {
    gsap.killTweensOf([
      this,
      this._contentContainer,
      this._title,
      this._character,
      this._collections,
      this._distanceStat,
      this._continueButton,
    ]);
  }

  public override destroy(
    options?:
      | boolean
      | {
          children?: boolean;
          texture?: boolean;
          baseTexture?: boolean;
        },
  ): void {
    this.killTweens();
    super.destroy(options);
  }
}
