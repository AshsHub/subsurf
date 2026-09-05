import { Container, Graphics, Text } from "pixi.js";
import gsap from "gsap";

export class ControlsDemo extends Container {
  private readonly _config = {
    keyWidth: 84,
    keyHeight: 56,
    keyGap: 100,
    keyRadius: 12,

    spaceWidth: 164,
    spaceHeight: 56,
    spaceGap: 18,

    characterY: 0,
    shadowY: 18,
    jumpHeight: 64,

    scale: 1.5,
    controlPadding: 24,
    minScale: 0.65,

    characterMove: 64,
  };

  private readonly _controlsContainer: Container;

  private readonly _leftKey: Container;
  private readonly _rightKey: Container;
  private readonly _spaceKey: Container;
  private readonly _character: Container;
  private readonly _characterShadow: Graphics;

  private readonly _timeline: gsap.core.Timeline;

  constructor() {
    super();

    this._controlsContainer = new Container();

    this._leftKey = this._createKey(
      "←/ A",
      this._config.keyWidth,
      this._config.keyHeight,
    );

    this._rightKey = this._createKey(
      "→/ D",
      this._config.keyWidth,
      this._config.keyHeight,
    );

    this._spaceKey = this._createKey(
      "SPACE / W",
      this._config.spaceWidth,
      this._config.spaceHeight,
    );

    const characterResult = this._createCharacter();

    this._character = characterResult.character;
    this._characterShadow = characterResult.shadow;

    this._controlsContainer.addChild(
      this._leftKey,
      this._rightKey,
      this._spaceKey,
      this._characterShadow,
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
    this._character.position.set(0, this._config.characterY);
    this._characterShadow.position.set(0, this._config.shadowY);
    this._leftKey.position.set(-horizontalOffset, 0);
    this._rightKey.position.set(horizontalOffset, 0);
    this._spaceKey.position.set(
      0,
      this._config.keyHeight + this._config.spaceGap,
    );
  }

  private _buildAnimation(): void {
    const movement = { x: 0 };
    const jump = { y: 0 };

    this._timeline
      .set(movement, { x: 0 })
      .set(jump, { y: 0 })
      .set(this._character, {
        x: 0,
        y: this._config.characterY,
      })
      .set(this._characterShadow, {
        x: 0,
        y: this._config.shadowY,
      })
      .set(this._characterShadow.scale, {
        x: 1,
        y: 1,
      })

      .to(this._leftKey.scale, {
        x: 0.9,
        y: 0.9,
        duration: 0.12,
        ease: "power2.out",
      })
      .to(
        movement,
        {
          x: -this._config.characterMove,
          duration: 0.45,
          ease: "power2.inOut",
          onUpdate: () => {
            this._character.x = movement.x;
            this._characterShadow.x = movement.x;
          },
        },
        "<",
      )
      .to(this._leftKey.scale, {
        x: 1,
        y: 1,
        duration: 0.12,
        ease: "back.out(2)",
      })

      .to(
        this._rightKey.scale,
        {
          x: 0.9,
          y: 0.9,
          duration: 0.12,
          ease: "power2.out",
        },
        "+=0.1",
      )
      .to(
        movement,
        {
          x: 0,
          duration: 0.45,
          ease: "power2.inOut",
          onUpdate: () => {
            this._character.x = movement.x;
            this._characterShadow.x = movement.x;
          },
        },
        "<",
      )
      .to(this._rightKey.scale, {
        x: 1,
        y: 1,
        duration: 0.12,
        ease: "back.out(2)",
      })

      .to(
        this._spaceKey.scale,
        {
          x: 0.92,
          y: 0.88,
          duration: 0.12,
          ease: "power2.out",
        },
        "+=0.15",
      )
      .to(
        this._characterShadow.scale,
        {
          x: 0.55,
          y: 0.55,
          duration: 0.2,
          ease: "power2.out",
        },
        "<",
      )
      .to(
        jump,
        {
          y: -this._config.jumpHeight,
          duration: 0.24,
          ease: "power2.out",
          onUpdate: () => {
            this._character.y = this._config.characterY + jump.y;
          },
        },
        "<",
      )
      .to(jump, {
        y: 0,
        duration: 0.3,
        ease: "power2.in",
        onUpdate: () => {
          this._character.y = this._config.characterY + jump.y;
        },
      })
      .to(
        this._characterShadow.scale,
        {
          x: 1,
          y: 1,
          duration: 0.2,
          ease: "back.out(2)",
        },
        "<0.12",
      )
      .to(this._spaceKey.scale, {
        x: 1,
        y: 1,
        duration: 0.18,
        ease: "back.out(2)",
      });
  }

  private _createKey(label: string, width: number, height: number): Container {
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

    const text = new Text(label, {
      fontFamily: "Bungee Regular",
      fontSize: label === "SPACE" ? 16 : 30,
      fill: 0xffffff,
      align: "center",
    });

    text.anchor.set(0.5);
    text.position.set(width / 2, height / 2);

    key.addChild(shadow, body, text);
    key.pivot.set(width / 2, height / 2);

    return key;
  }

  private _createCharacter(): {
    character: Container;
    shadow: Graphics;
  } {
    const character = new Container();

    const shadow = new Graphics();

    shadow.beginFill(0x000000, 0.22);
    shadow.drawEllipse(0, -4, 46, 9);
    shadow.endFill();

    const body = new Graphics();

    body.lineStyle(2, 0xffffff, 0.9);
    body.beginFill(0x8bd8ff);
    body.drawRoundedRect(-20, -25, 40, 42, 15);
    body.endFill();

    const visor = new Graphics();

    visor.lineStyle(1, 0xffffff, 0.35);
    visor.beginFill(0x18202b);
    visor.drawRoundedRect(-13, -17, 26, 15, 7);
    visor.endFill();

    const leftEye = new Graphics();

    leftEye.beginFill(0xffffff);
    leftEye.drawCircle(-6, -10, 2);
    leftEye.endFill();

    const rightEye = new Graphics();

    rightEye.beginFill(0xffffff);
    rightEye.drawCircle(6, -10, 2);
    rightEye.endFill();

    const leftFoot = new Graphics();

    leftFoot.beginFill(0x5a9ec5);
    leftFoot.drawRoundedRect(-16, 10, 11, 8, 4);
    leftFoot.endFill();

    const rightFoot = new Graphics();

    rightFoot.beginFill(0x5a9ec5);
    rightFoot.drawRoundedRect(5, 10, 11, 8, 4);
    rightFoot.endFill();

    character.addChild(body, visor, leftEye, rightEye, leftFoot, rightFoot);

    return {
      character,
      shadow,
    };
  }
}
