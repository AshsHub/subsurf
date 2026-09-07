import { Container } from "pixi.js";
import gsap from "gsap/gsap-core";
import { Character } from "./Character";
import { SwipePointer } from "./SwiperPointer";

type SwipeDirection = "left" | "right" | "up";

export class MobileControlsDemo extends Container {
  private readonly _config = {
    scale: 1.5,
    minScale: 0.5,

    controlPadding: 24,

    horizontalSwipeDistance: 150,
    verticalSwipeDistance: 150,

    // Position of the horizontal gesture relative to the character.
    horizontalX: 0,
    horizontalY: 90,

    // Position of the vertical gesture relative to the character.
    verticalX: 90,
    verticalY: 0,

    characterMove: 64,
    characterSpeed: 140,
  };

  private readonly _controlsContainer: Container;
  private readonly _character: Character;
  private readonly _swipePointer: SwipePointer;

  private readonly _sequence: SwipeDirection[] = [
    "left",
    "right",
    "up",
    "right",
    "left",
    "up",
  ];

  private _sequenceId = 0;

  constructor() {
    super();

    this._controlsContainer = new Container();
    this._character = new Character();
    this._swipePointer = new SwipePointer();
    this._controlsContainer.addChild(this._character, this._swipePointer);
    this.addChild(this._controlsContainer);
    this.visible = false;
  }

  public show(): void {
    this.visible = true;
    gsap.killTweensOf(this);
    this._sequenceId++;
    this.alpha = 0;
    gsap.to(this, {
      alpha: 1,
      duration: 0.5,
      delay: 0.5,
      ease: "power4.out",
    });

    gsap.delayedCall(1, () => {
      void this._playSequence(this._sequenceId);
    });
  }

  public hide(): void {
    this._sequenceId++;
    this._swipePointer.reset();
    gsap.killTweensOf(this);
    gsap.to(this, {
      alpha: 0,
      duration: 0.3,
      ease: "power4.in",
      onComplete: () => {
        this.visible = false;
        this._swipePointer.reset();
        this._character.reset();
      },
    });
  }

  public onResize(width: number, height: number): void {
    const availableWidth = width - this._config.controlPadding * 2;
    const responsiveScale = availableWidth / 640;
    const scale = Math.max(
      this._config.minScale,
      Math.min(this._config.scale, responsiveScale),
    );
    this._controlsContainer.scale.set(scale);
    this._controlsContainer.position.set(width / 2, height * 0.7);
    this._character.position.set(0, 0);
    this._positionHorizontalGesture();
  }

  private async _playSequence(sequenceId: number): Promise<void> {
    let index = 0;

    while (this.visible && sequenceId === this._sequenceId) {
      const direction = this._sequence[index % this._sequence.length];

      this._positionGesture(direction);

      const { x, y } = this._getSwipeTarget(direction);

      this._swipePointer.animateTo(x, y);

      await this._delay(500);

      if (!this.visible || sequenceId !== this._sequenceId) {
        return;
      }

      this._animateCharacter(direction);

      await this._delay(1000);

      index++;
    }
  }

  private _delay(duration: number): Promise<void> {
    return new Promise((resolve) => {
      gsap.delayedCall(duration / 1000, resolve);
    });
  }

  private _animateCharacter(direction: SwipeDirection): gsap.core.Animation {
    switch (direction) {
      case "left":
        return this._character
          .moveLeft(this._config.characterMove, this._config.characterSpeed)
          .play();
      case "right":
        return this._character
          .moveRight(this._config.characterMove, this._config.characterSpeed)
          .play();
      case "up":
        return this._character.jump().play();
    }
  }

  private _positionGesture(direction: SwipeDirection): void {
    switch (direction) {
      case "left":
      case "right":
        this._positionHorizontalGesture();
        break;
      case "up":
        this._positionVerticalGesture();
        break;
    }
  }

  private _positionHorizontalGesture(): void {
    this._swipePointer.position.set(
      this._config.horizontalX,
      this._config.horizontalY,
    );
  }

  private _positionVerticalGesture(): void {
    this._swipePointer.position.set(
      this._config.verticalX,
      this._config.verticalY,
    );
  }

  private _getSwipeTarget(direction: SwipeDirection): { x: number; y: number } {
    switch (direction) {
      case "left":
        return {
          x: -this._config.horizontalSwipeDistance,
          y: 0,
        };
      case "right":
        return {
          x: this._config.horizontalSwipeDistance,
          y: 0,
        };
      case "up":
        return {
          x: 0,
          y: -this._config.verticalSwipeDistance,
        };
    }
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
    this._sequenceId++;
    this._swipePointer.destroy();
    super.destroy(options);
  }
}
