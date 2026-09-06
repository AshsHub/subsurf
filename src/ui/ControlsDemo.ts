import { Assets, Container, Graphics, Sprite } from "pixi.js";
import gsap from "gsap";
import { Character } from "./Character";

export class ControlsDemo extends Container {
  private readonly _config = {
    keyWidth: 84,
    keyHeight: 56,
    keyGap: 100,
    keyRadius: 12,

    spaceWidth: 164,
    spaceHeight: 56,
    spaceGap: 18,

    scale: 1.5,
    controlPadding: 24,
    minScale: 0.65,

    characterMove: 64,
    characterSpeed: 140,

    iconPadding: 14,
  };

  private readonly _controlsContainer: Container;

  private readonly _leftKey: Container;
  private readonly _rightKey: Container;
  private readonly _spaceKey: Container;
  private readonly _character: Character;

  private readonly _timeline: gsap.core.Timeline;

  constructor() {
    super();

    this._controlsContainer = new Container();

    this._leftKey = this._createKey(
      "icon-arrow-left",
      this._config.keyWidth,
      this._config.keyHeight,
    );

    this._rightKey = this._createKey(
      "icon-arrow-right",
      this._config.keyWidth,
      this._config.keyHeight,
    );

    this._spaceKey = this._createKey(
      "icon-space-bar",
      this._config.spaceWidth,
      this._config.spaceHeight,
    );

    this._character = new Character();

    this._controlsContainer.addChild(
      this._leftKey,
      this._rightKey,
      this._spaceKey,
      this._character,
    );

    this.addChild(this._controlsContainer);

    this._timeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.35,
    });

    this._buildAnimation();

    this.visible = false;
  }

  public show(): void {
    this.visible = true;

    gsap.killTweensOf(this);

    this.alpha = 0;

    gsap.to(this, {
      alpha: 1,
      duration: 1,
      delay: 1,
      ease: "power4.out",
    });

    this._timeline.restart();
  }

  public hide(): void {
    gsap.killTweensOf(this);

    gsap.to(this, {
      alpha: 0,
      duration: 0.3,
      ease: "power4.in",
      onComplete: () => {
        this.visible = false;
        this._timeline.pause();
        this._character.reset();
      },
    });
  }

  public onResize(width: number, height: number): void {
    const horizontalOffset = this._config.keyWidth + this._config.keyGap;

    const requiredWidth =
      horizontalOffset * 2 +
      this._config.keyWidth +
      this._config.controlPadding * 2;

    const availableWidth = width - this._config.controlPadding * 2;

    const responsiveScale = availableWidth / requiredWidth;

    const scale = Math.max(
      this._config.minScale,
      Math.min(this._config.scale, responsiveScale),
    );

    this._controlsContainer.scale.set(scale);

    this._controlsContainer.position.set(width / 2, height * 0.7);

    this._leftKey.position.set(-horizontalOffset, 0);

    this._rightKey.position.set(horizontalOffset, 0);

    this._spaceKey.position.set(
      0,
      this._config.keyHeight + this._config.spaceGap,
    );
  }

  private _addKeyAnimation(
    key: gsap.TweenTarget,
    action: () => void,
    options?: {
      scaleX?: number;
      scaleY?: number;
      delay?: number;
    },
  ): void {
    const { scaleX = 0.9, scaleY = 0.9, delay = 0.5 } = options ?? {};

    this._timeline
      .to(
        key,
        {
          x: scaleX,
          y: scaleY,
          duration: 0.15,
          ease: "power2.out",
          onStart: action,
        },
        `+=${delay}`,
      )
      .to(key, {
        x: 1,
        y: 1,
        duration: 0.25,
        ease: "back.out(2)",
      });
  }

  private _buildAnimation(): void {
    this._timeline.clear();

    this._addKeyAnimation(this._leftKey.scale, () => {
      this._character
        .moveLeft(this._config.characterMove, this._config.characterSpeed)
        .play();
    });

    this._addKeyAnimation(this._rightKey.scale, () => {
      this._character
        .moveRight(this._config.characterMove, this._config.characterSpeed)
        .play();
    });

    this._addKeyAnimation(
      this._spaceKey.scale,
      () => {
        this._character.jump().play();
      },
      {
        scaleX: 0.92,
        scaleY: 0.88,
      },
    );

    this._addKeyAnimation(this._rightKey.scale, () => {
      this._character
        .moveRight(this._config.characterMove, this._config.characterSpeed)
        .play();
    });

    this._addKeyAnimation(this._leftKey.scale, () => {
      this._character
        .moveLeft(this._config.characterMove, this._config.characterSpeed)
        .play();
    });

    this._addKeyAnimation(
      this._spaceKey.scale,
      () => {
        this._character.jump().play();
      },
      {
        scaleX: 0.92,
        scaleY: 0.88,
      },
    );

    this._timeline.repeat(-1);
  }

  private _createKey(
    textureAlias: string,
    width: number,
    height: number,
  ): Container {
    const key = new Container();

    const shadow = new Graphics();

    shadow.beginFill(0x000000, 0.3);
    shadow.drawRoundedRect(2, 4, width, height, this._config.keyRadius);
    shadow.endFill();

    const body = new Graphics();

    body.lineStyle(2, 0x738092, 0.95);
    body.beginFill(0x18202b, 0.96);
    body.drawRoundedRect(0, 0, width, height, this._config.keyRadius);
    body.endFill();

    const texture = Assets.get(textureAlias);

    if (!texture) {
      throw new Error(
        `Control icon texture "${textureAlias}" has not been loaded.`,
      );
    }

    const icon = new Sprite(texture);

    icon.anchor.set(0.5);
    icon.position.set(width / 2, height / 2);

    // Keep the icon inside the key while preserving its aspect ratio.
    const maxWidth = width - this._config.iconPadding * 2;
    const maxHeight = height - this._config.iconPadding * 2;

    const scale = Math.min(
      maxWidth / icon.texture.width,
      maxHeight / icon.texture.height,
    );

    icon.scale.set(scale);

    key.addChild(shadow, body, icon);

    key.pivot.set(width / 2, height / 2);

    return key;
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
    this._timeline.kill();

    super.destroy(options);
  }
}
