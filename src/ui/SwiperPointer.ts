import { Assets, Container, Graphics, Sprite } from "pixi.js";
import gsap from "gsap";

export class SwipePointer extends Container {
  private readonly _config = {
    pointerSize: 56,

    pressedScale: 0.88,
    pressDuration: 0.12,

    moveDuration: 0.45,

    releaseScale: 1,
    releaseDuration: 0.2,

    shadowSize: 18,
    shadowRadius: 9,
    shadowAlpha: 0.4,
    shadowColor: 0xffffff,
    shadowFadeDuration: 0.1,
    fadeDuration: 0.25,
  };

  private readonly _pointer: Sprite;
  private readonly _shadow: Graphics;

  private readonly _state = {
    progress: 0,
  };

  private _animation?: gsap.core.Timeline;

  private _targetX = 0;
  private _targetY = 0;

  private _basePointerScale = 1;

  constructor() {
    super();

    this._shadow = new Graphics();

    const texture = Assets.get("icon-pointer");

    if (!texture) {
      throw new Error(
        'Control icon texture "icon-pointer" has not been loaded.',
      );
    }

    this._pointer = new Sprite(texture);
    this._pointer.anchor.set(0.4004, 0.03125);

    const scale = Math.min(
      this._config.pointerSize / texture.width,
      this._config.pointerSize / texture.height,
    );

    this._basePointerScale = scale;

    this._pointer.scale.set(scale);

    this.addChild(this._shadow, this._pointer);

    this._reset();
  }

  public animateTo(x: number, y: number): Promise<void> {
    this._animation?.kill();

    this._targetX = x;
    this._targetY = y;

    this._reset();

    return new Promise((resolve) => {
      this._animation = gsap.timeline({
        onComplete: () => {
          this._animation = undefined;
          resolve();
        },
      });

      this._animation
        .to(this._pointer.scale, {
          x: this._basePointerScale * this._config.pressedScale,
          y: this._basePointerScale * this._config.pressedScale,
          duration: this._config.pressDuration,
          ease: "power2.out",
        })
        .to(this._shadow, {
          alpha: 1,
          duration: this._config.shadowFadeDuration,
          ease: "power2.out",
        })
        .to(this._state, {
          progress: 1,
          duration: this._config.moveDuration,
          ease: "power2.inOut",
          onUpdate: () => {
            this._updatePosition();
          },
        })
        .to(this._pointer.scale, {
          x: this._basePointerScale * this._config.releaseScale,
          y: this._basePointerScale * this._config.releaseScale,
          duration: this._config.releaseDuration,
          ease: "back.out(2)",
        })
        .to(this, {
          alpha: 0,
          duration: this._config.fadeDuration,
          ease: "power2.in",
        });
    });
  }

  public reset(): void {
    this._animation?.kill();
    this._animation = undefined;

    this._reset();
  }

  private _reset(): void {
    this.alpha = 1;

    this._state.progress = 0;

    this._pointer.position.set(0, 0);
    this._pointer.scale.set(this._basePointerScale);

    this._shadow.clear();
    this._shadow.alpha = 0;
  }

  private _updatePosition(): void {
    const progress = this._state.progress;

    const x = this._targetX * progress;
    const y = this._targetY * progress;

    this._pointer.position.set(x, y);

    this._drawShadow(x, y);
  }

  private _drawShadow(x: number, y: number): void {
    this._shadow.clear();

    if (x === 0 && y === 0) {
      return;
    }

    this._shadow.beginFill(this._config.shadowColor, this._config.shadowAlpha);

    if (Math.abs(x) >= Math.abs(y)) {
      this._drawHorizontalShadow(x);
    } else {
      this._drawVerticalShadow(y);
    }

    this._shadow.endFill();
  }

  private _drawHorizontalShadow(x: number): void {
    const width = Math.abs(x);

    this._shadow.drawRoundedRect(
      Math.min(0, x),
      -this._config.shadowSize / 2,
      width,
      this._config.shadowSize,
      this._config.shadowRadius,
    );
  }

  private _drawVerticalShadow(y: number): void {
    const height = Math.abs(y);

    this._shadow.drawRoundedRect(
      -this._config.shadowSize / 2,
      Math.min(0, y),
      this._config.shadowSize,
      height,
      this._config.shadowRadius,
    );
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
    this._animation?.kill();

    super.destroy(options);
  }
}
