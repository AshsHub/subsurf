import { Container, Graphics } from "pixi.js";
import gsap from "gsap";

export class Character extends Container {
  private readonly _shadow: Graphics;
  private readonly _character: Container;

  private readonly _body: Graphics;
  private readonly _visor: Graphics;
  private readonly _leftEye: Graphics;
  private readonly _rightEye: Graphics;
  private readonly _leftFoot: Graphics;
  private readonly _rightFoot: Graphics;

  private readonly _config = {
    bodyWidth: 40,
    bodyHeight: 42,
    bodyRadius: 15,

    visorWidth: 26,
    visorHeight: 15,
    visorRadius: 7,

    eyeRadius: 2,

    footWidth: 11,
    footHeight: 8,
    footRadius: 4,

    shadowWidth: 46,
    shadowHeight: 9,
    shadowY: 18,

    walkBounce: 3,
    walkRotation: 0.04,
    walkStepDuration: 0.16,

    jumpHeight: 64,
  };

  constructor() {
    super();

    this._shadow = new Graphics();

    this._shadow.beginFill(0x000000, 0.22);
    this._shadow.drawEllipse(
      0,
      -4,
      this._config.shadowWidth,
      this._config.shadowHeight,
    );
    this._shadow.endFill();

    this._character = new Container();

    this._body = new Graphics();

    this._body.lineStyle(2, 0xffffff, 0.9);
    this._body.beginFill(0x8bd8ff);
    this._body.drawRoundedRect(
      -20,
      -25,
      this._config.bodyWidth,
      this._config.bodyHeight,
      this._config.bodyRadius,
    );
    this._body.endFill();

    this._visor = new Graphics();

    this._visor.lineStyle(1, 0xffffff, 0.35);
    this._visor.beginFill(0x18202b);
    this._visor.drawRoundedRect(
      -13,
      -17,
      this._config.visorWidth,
      this._config.visorHeight,
      this._config.visorRadius,
    );
    this._visor.endFill();

    this._leftEye = new Graphics();

    this._leftEye.beginFill(0xffffff);
    this._leftEye.drawCircle(-6, -10, this._config.eyeRadius);
    this._leftEye.endFill();

    this._rightEye = new Graphics();

    this._rightEye.beginFill(0xffffff);
    this._rightEye.drawCircle(6, -10, this._config.eyeRadius);
    this._rightEye.endFill();

    this._leftFoot = new Graphics();

    this._leftFoot.beginFill(0x5a9ec5);
    this._leftFoot.drawRoundedRect(
      -16,
      10,
      this._config.footWidth,
      this._config.footHeight,
      this._config.footRadius,
    );
    this._leftFoot.endFill();

    this._rightFoot = new Graphics();

    this._rightFoot.beginFill(0x5a9ec5);
    this._rightFoot.drawRoundedRect(
      5,
      10,
      this._config.footWidth,
      this._config.footHeight,
      this._config.footRadius,
    );
    this._rightFoot.endFill();

    this._character.addChild(
      this._body,
      this._visor,
      this._leftEye,
      this._rightEye,
      this._leftFoot,
      this._rightFoot,
    );

    this.addChild(this._shadow, this._character);

    this.reset();
  }

  public reset(): void {
    gsap.killTweensOf([
      this,
      this._character,
      this._shadow,
      this._shadow.scale,
      this._body,
      this._visor,
      this._leftEye,
      this._rightEye,
      this._leftFoot,
      this._rightFoot,
    ]);

    this.position.set(0, 0);
    this.scale.set(1);
    this.rotation = 0;
    this.alpha = 1;

    this._character.position.set(0, 0);
    this._character.scale.set(1);
    this._character.rotation = 0;

    this._shadow.position.set(0, this._config.shadowY);
    this._shadow.scale.set(1);
    this._shadow.alpha = 1;

    this._body.scale.set(1);
    this._body.rotation = 0;

    this._visor.scale.set(1);
    this._leftEye.scale.set(1);
    this._rightEye.scale.set(1);
    this._leftFoot.scale.set(1);
    this._rightFoot.scale.set(1);
  }

  public moveX(x: number): void {
    this.x = x;
  }

  public moveLeft(distance: number, speed: number): gsap.core.Timeline {
    return this._createWalkTimeline(-Math.abs(distance), speed);
  }

  public moveRight(distance: number, speed: number): gsap.core.Timeline {
    return this._createWalkTimeline(Math.abs(distance), speed);
  }

  private _createWalkTimeline(
    distance: number,
    speed: number,
  ): gsap.core.Timeline {
    const direction = distance >= 0 ? 1 : -1;
    const duration = Math.abs(distance) / Math.max(speed, 1);

    const timeline = gsap.timeline();

    timeline
      .set(this.scale, {
        x: Math.abs(this.scale.x) * direction,
      })
      .to(this, {
        x: `+=${distance}`,
        duration,
        ease: "none",

        onUpdate: () => {
          const phase =
            (timeline.time() / this._config.walkStepDuration) * Math.PI * 2;

          this._character.y =
            -Math.abs(Math.sin(phase)) * this._config.walkBounce;

          this._character.rotation =
            Math.sin(phase) * this._config.walkRotation * direction;
        },

        onComplete: () => {
          this._character.y = 0;
          this._character.rotation = 0;
        },
      });

    return timeline;
  }

  private _createJumpTimeline(
    height: number,
    upDuration: number,
    downDuration: number,
  ): gsap.core.Timeline {
    const movement = {
      y: 0,
    };

    const timeline = gsap.timeline();

    timeline
      .to(movement, {
        y: -height,
        duration: upDuration,
        ease: "power2.out",
        onUpdate: () => {
          this._character.y = movement.y;

          const progress = -movement.y / height;
          const scale = 1 - progress * 0.45;

          this._shadow.scale.set(scale);
        },
      })
      .to(movement, {
        y: 0,
        duration: downDuration,
        ease: "power2.in",
        onUpdate: () => {
          this._character.y = movement.y;

          const progress = -movement.y / height;
          const scale = 1 - progress * 0.45;

          this._shadow.scale.set(scale);
        },
      })
      .set(this._character, {
        y: 0,
      })
      .set(this._shadow, {
        y: this._config.shadowY,
      })
      .set(this._shadow.scale, {
        x: 1,
        y: 1,
      });

    return timeline;
  }

  public jump(height = this._config.jumpHeight): gsap.core.Timeline {
    return this._createJumpTimeline(height, 0.24, 0.3);
  }

  public celebrate(height = this._config.jumpHeight): gsap.core.Timeline {
    const timeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.5,
    });

    timeline
      .set(this._character, {
        y: 0,
        rotation: 0,
      })
      .set(this._character.scale, {
        x: 1,
        y: 1,
      })
      .set(this._shadow.scale, {
        x: 1,
        y: 1,
      })

      // Celebratory wiggle
      .to(this._character, {
        rotation: -0.08,
        duration: 0.08,
        ease: "sine.inOut",
      })
      .to(this._character, {
        rotation: 0.08,
        duration: 0.08,
        ease: "sine.inOut",
      })
      .to(this._character, {
        rotation: -0.06,
        duration: 0.08,
        ease: "sine.inOut",
      })
      .to(this._character, {
        rotation: 0.06,
        duration: 0.08,
        ease: "sine.inOut",
      })
      .to(this._character, {
        rotation: 0,
        duration: 0.08,
        ease: "sine.out",
      })

      // Normal jump
      .add(this._createJumpTimeline(height, 0.24, 0.3));

    return timeline;
  }

  public defeat(): gsap.core.Timeline {
    const timeline = gsap.timeline();

    timeline
      .set(this._character, {
        y: 0,
        rotation: 0,
      })
      .to(this._character, {
        rotation: -0.12,
        duration: 0.15,
        ease: "power2.out",
      })
      .to(this._character, {
        rotation: 0.12,
        duration: 0.2,
        ease: "power2.inOut",
      })
      .to(this._character, {
        rotation: -0.06,
        duration: 0.15,
        ease: "power2.inOut",
      })
      .to(this._character, {
        rotation: 0,
        duration: 0.15,
        ease: "power2.out",
      });

    return timeline;
  }

  public fallOver(): gsap.core.Timeline {
    const timeline = gsap.timeline();

    const fallenY = -5;
    const fallenRotation = 1.3;

    timeline
      .set(this._character, {
        y: 0,
        x: 0,
        rotation: 0,
      })
      .to(this._character, {
        rotation: 0.12,
        duration: 0.12,
        ease: "power2.out",
      })
      .to(this._character, {
        y: fallenY,
        x: 20,
        rotation: fallenRotation,
        duration: 0.2,
        ease: "power3.in",
        delay: 0.2,
      });

    return timeline;
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
    gsap.killTweensOf([
      this,
      this._character,
      this._shadow,
      this._shadow.scale,
      this._body,
      this._visor,
      this._leftEye,
      this._rightEye,
      this._leftFoot,
      this._rightFoot,
    ]);

    super.destroy(options);
  }
}
