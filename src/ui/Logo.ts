import { Container, Text, TextStyle } from "pixi.js";
import gsap from "gsap";

export interface LogoOptions {
  text?: string;

  fontFamily?: string;
  fontSize?: number;
  fill?: string | number;

  stroke?: string | number;
  strokeThickness?: number;

  letterSpacing?: number;
  characterSpacing?: number;

  animation?: LogoAnimation;

  animationDuration?: number;
  animationDelay?: number;

  x?: number;
  y?: number;
}

export type LogoAnimation =
  | "none"
  | "rock"
  | "bounce"
  | "jump"
  | "wave"
  | "pop";

export class Logo extends Container {
  readonly letters: Text[] = [];

  private _text: string;

  private _fontFamily: string;
  private _fontSize: number;
  private _fill: string | number;

  private _stroke: string | number;
  private _strokeThickness: number;

  private _letterSpacing: number;
  private _characterSpacing: number;

  private _animation: LogoAnimation;

  private _animationDuration: number;
  private _animationDelay: number;

  private readonly basePositions = new Map<Text, { x: number; y: number }>();

  constructor(options: LogoOptions = {}) {
    super();

    this._text = options.text ?? "SUBWAY";

    this._fontFamily = options.fontFamily ?? "Bungee";
    this._fontSize = options.fontSize ?? 64;
    this._fill = options.fill ?? 0xffffff;

    this._stroke = options.stroke ?? 0x000000;
    this._strokeThickness = options.strokeThickness ?? 6;

    this._letterSpacing = options.letterSpacing ?? 0;
    this._characterSpacing = options.characterSpacing ?? 0;

    this._animation = options.animation ?? "wave";

    this._animationDuration = options.animationDuration ?? 0.5;
    this._animationDelay = options.animationDelay ?? 0.075;

    this.position.set(options.x ?? 0, options.y ?? 0);

    this.build();
  }

  get text() {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
    this.build();
  }

  get fontFamily() {
    return this._fontFamily;
  }

  set fontFamily(value: string) {
    this._fontFamily = value;
    this.build();
  }

  get fontSize() {
    return this._fontSize;
  }

  set fontSize(value: number) {
    this._fontSize = value;
    this.build();
  }

  get fill() {
    return this._fill;
  }

  set fill(value: string | number) {
    this._fill = value;
    this.build();
  }

  get animation() {
    return this._animation;
  }

  set animation(value: LogoAnimation) {
    if (value === this._animation) {
      return;
    }

    this.transitionToAnimation(value);
  }

  private build() {
    this.killAnimation();

    for (const letter of this.letters) {
      letter.destroy();
    }

    this.letters.length = 0;
    this.basePositions.clear();

    const style = new TextStyle({
      fontFamily: this._fontFamily,
      fontSize: this._fontSize,
      fill: this._fill,

      letterSpacing: this._letterSpacing,

      stroke: this._stroke,
      strokeThickness: this._strokeThickness,

      align: "center",
    });

    let x = 0;

    for (const character of this._text) {
      const letter = new Text(character, style);

      // Keep transforms centred on each character.
      letter.anchor.set(0.5);

      letter.x = x + letter.width * 0.5;
      letter.y = 0;

      this.addChild(letter);
      this.letters.push(letter);

      this.basePositions.set(letter, {
        x: letter.x,
        y: letter.y,
      });

      x += letter.width + this._characterSpacing;
    }

    this.center();

    if (this._animation !== "none") {
      this.playAnimation();
    }
  }

  center() {
    if (this.letters.length === 0) {
      return this;
    }

    const bounds = this.getLocalBounds();

    for (const letter of this.letters) {
      letter.x -= bounds.x + bounds.width * 0.5;
      letter.y -= bounds.y + bounds.height * 0.5;

      const base = this.basePositions.get(letter);

      if (base) {
        base.x = letter.x;
        base.y = letter.y;
      }
    }

    return this;
  }

  private transitionToAnimation(value: LogoAnimation) {
    this.killAnimation();

    this._animation = value;

    if (value === "none") {
      this.transitionToBase();
      return;
    }

    this.transitionToBase(() => {
      this.playAnimation();
    });
  }

  private transitionToBase(onComplete?: () => void) {
    const timeline = gsap.timeline({
      onComplete,
    });

    for (const letter of this.letters) {
      const base = this.basePositions.get(letter);

      if (!base) {
        continue;
      }

      timeline.to(
        letter,
        {
          x: base.x,
          y: base.y,
          rotation: 0,

          duration: 0.12,
          ease: "power2.out",

          overwrite: true,
        },
        0,
      );

      timeline.to(
        letter.scale,
        {
          x: 1,
          y: 1,

          duration: 0.12,
          ease: "power2.out",

          overwrite: true,
        },
        0,
      );
    }
  }

  playAnimation() {
    this.killAnimation();

    switch (this._animation) {
      case "rock":
        this.playRock();
        break;

      case "bounce":
        this.playBounce();
        break;

      case "jump":
        this.playJump();
        break;

      case "wave":
        this.playWave();
        break;

      case "pop":
        this.playPop();
        break;

      case "none":
        break;
    }

    return this;
  }

  stopAnimation() {
    this.killAnimation();
    this.resetLetters();

    return this;
  }

  private killAnimation() {
    for (const letter of this.letters) {
      gsap.killTweensOf(letter);
      gsap.killTweensOf(letter.position);
      gsap.killTweensOf(letter.scale);
    }
  }

  private resetLetters() {
    for (const letter of this.letters) {
      const base = this.basePositions.get(letter);

      if (!base) {
        continue;
      }

      letter.x = base.x;
      letter.y = base.y;
      letter.rotation = 0;
      letter.scale.set(1);
    }
  }

  private playRock() {
    this.letters.forEach((letter, index) => {
      gsap.to(letter, {
        rotation: index % 2 === 0 ? 0.06 : -0.06,

        duration: this._animationDuration,

        delay: index * this._animationDelay,

        ease: "sine.inOut",

        yoyo: true,
        repeat: -1,

        overwrite: true,
      });
    });
  }

  private playBounce() {
    this.letters.forEach((letter, index) => {
      const base = this.basePositions.get(letter);

      if (!base) {
        return;
      }

      gsap.to(letter, {
        y: base.y - 8,

        duration: this._animationDuration,

        delay: index * this._animationDelay,

        ease: "sine.inOut",

        yoyo: true,
        repeat: -1,

        overwrite: true,
      });
    });
  }

  private playJump() {
    this.letters.forEach((letter, index) => {
      const base = this.basePositions.get(letter);

      if (!base) {
        return;
      }

      const timeline = gsap.timeline({
        delay: index * this._animationDelay,
        repeat: -1,
      });

      timeline
        .to(letter, {
          y: base.y - 14,
          duration: 0.18,
          ease: "power2.out",
        })
        .to(letter, {
          y: base.y,
          duration: 0.25,
          ease: "bounce.out",
        })
        .to(letter, {
          duration: 0.7,
        });
    });
  }

  private playWave() {
    this.letters.forEach((letter, index) => {
      const base = this.basePositions.get(letter);

      if (!base) {
        return;
      }

      gsap.to(letter, {
        y: base.y - 7,

        rotation: index % 2 === 0 ? 0.04 : -0.04,

        duration: this._animationDuration,

        delay: index * this._animationDelay,

        ease: "sine.inOut",

        yoyo: true,
        repeat: -1,

        overwrite: true,
      });
    });
  }

  private playPop() {
    this.letters.forEach((letter, index) => {
      gsap.to(letter.scale, {
        x: 1.08,
        y: 1.08,

        duration: this._animationDuration * 0.6,

        delay: index * this._animationDelay,

        ease: "back.out(2)",

        yoyo: true,
        repeat: -1,

        overwrite: true,
      });
    });
  }

  /**
   * Makes each letter jump once in sequence.
   */
  public jumpOnce() {
    this.letters.forEach((letter, index) => {
      const base = this.basePositions.get(letter);

      if (!base) {
        return;
      }

      gsap
        .timeline({
          delay: index * this._animationDelay,
        })
        .to(letter, {
          y: base.y - 14,
          duration: 0.18,
          ease: "power2.out",
        })
        .to(letter, {
          y: base.y,
          duration: 0.3,
          ease: "bounce.out",
        });
    });

    return this;
  }

  /**
   * Gives the entire word a quick energetic bounce.
   */
  public popOnce() {
    this.letters.forEach((letter, index) => {
      gsap.fromTo(
        letter.scale,
        {
          x: 1,
          y: 1,
        },
        {
          x: 1.15,
          y: 1.15,

          duration: 0.15,

          delay: index * this._animationDelay,

          ease: "back.out(2)",

          yoyo: true,
          repeat: 1,

          overwrite: true,
        },
      );
    });

    return this;
  }

  /**
   * Throws each letter upward and outward with gravity.
   */
  public async explodeOnce(): Promise<void> {
    this.killAnimation();

    const timeline = gsap.timeline();

    this.letters.forEach((letter) => {
      const base = this.basePositions.get(letter);

      if (!base) {
        return;
      }

      const direction = Math.random() < 0.5 ? -1 : 1;

      const velocityX = direction * (120 + Math.random() * 180);
      const velocityY = -(300 + Math.random() * 180);
      const gravity = 700 + Math.random() * 200;

      const rotationVelocity = (Math.random() - 0.5) * 10;

      const duration = 0.8 + Math.random() * 0.3;

      letter.x = base.x;
      letter.y = base.y;
      letter.rotation = 0;
      letter.alpha = 1;
      letter.scale.set(1);

      const state = { time: 0 };

      timeline.to(
        state,
        {
          time: duration,
          duration,
          ease: "none",

          onUpdate: () => {
            const t = state.time;
            letter.x = base.x + velocityX * t;
            letter.y = base.y + velocityY * t + 0.5 * gravity * t * t;
            letter.rotation = rotationVelocity * t;
            const fadeStart = 0.65;

            if (t > duration * fadeStart) {
              const fadeProgress =
                (t - duration * fadeStart) / (duration * (1 - fadeStart));
              letter.alpha = 1 - fadeProgress;
              const scale = 1 - fadeProgress * 0.8;
              letter.scale.set(scale);
            }
          },

          onComplete: () => {
            letter.alpha = 0;
            letter.scale.set(0);
          },
        },
        0,
      );
    });

    await new Promise<void>((resolve) => {
      timeline.eventCallback("onComplete", resolve);
    });
  }

  override destroy(
    options?:
      | boolean
      | {
          children?: boolean;
          texture?: boolean;
          baseTexture?: boolean;
        },
  ) {
    this.killAnimation();

    for (const letter of this.letters) {
      letter.destroy();
    }

    this.letters.length = 0;

    this.basePositions.clear();

    super.destroy(options);
  }
}
