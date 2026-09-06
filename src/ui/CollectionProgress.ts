import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { gsap } from "gsap";

export interface CollectionProgressOptions {
  target: number;
  displayScale?: number;
}

export class CollectionProgress extends Container {
  private static readonly CONFIG = {
    size: {
      width: 260,
      height: 42,
      radius: 21,
    },

    bar: {
      padding: 5,
      radius: 19,
      textPadding: 7,
      orbGap: 5,
    },

    icon: {
      centerY: 21,
      orbRadius: 5,
      orbSpacing: 7,
      redY: -4,
      blueY: -4,
      greenY: 5,
      // Extra space needed around the orb cluster.
      outerPadding: 5,
    },

    text: {
      fontSize: 24,
      letterSpacing: 0.8,
      strokeThickness: 4,
    },

    colors: {
      outline: 0x00ff82,
      track: 0x071b25,
      trackInner: 0x0c2b35,
      fill: 0x00e879,
      fillBright: 0x18ff94,
      fillSoft: 0x00bf6b,
      text: 0xffffff,
      textOutline: 0x071b25,
      red: 0xf0445f,
      blue: 0x3f8cff,
      green: 0x4dcc7a,
      orbHighlight: 0xffffff,
    },

    glow: {
      outerAlpha: 0.14,
      middleAlpha: 0.22,
    },

    animation: {
      duration: 0.35,
      ease: "power2.out",
    },
  } as const;

  private readonly _outerGlow: Graphics;
  private readonly _middleGlow: Graphics;
  private readonly _background: Graphics;
  private readonly _backgroundInner: Graphics;

  private readonly _fill: Graphics;
  private readonly _fillHighlight: Graphics;
  private readonly _fillGlow: Graphics;
  private readonly _fillMask: Graphics;

  private readonly _icon: Container;
  private readonly _orbRed: Graphics;
  private readonly _orbBlue: Graphics;
  private readonly _orbGreen: Graphics;
  private _displayScale = 1;

  private readonly _valueText: Text;

  private readonly _progressTween = {
    value: 0,
  };

  private _target: number;
  private _value = 0;

  constructor(options: CollectionProgressOptions) {
    super();

    const target = Math.floor(options.target);

    if (target <= 0) {
      throw new Error("CollectionProgress target must be greater than zero");
    }

    this._target = target;

    const config = CollectionProgress.CONFIG;
    const { width, height, radius } = config.size;

    this._outerGlow = new Graphics()
      .lineStyle(3, config.colors.outline, config.glow.outerAlpha)
      .drawRoundedRect(1, 1, width - 2, height - 2, radius);

    this._middleGlow = new Graphics()
      .lineStyle(2, config.colors.outline, config.glow.middleAlpha)
      .drawRoundedRect(2, 2, width - 4, height - 4, radius - 1);

    this._background = new Graphics()
      .beginFill(config.colors.track)
      .drawRoundedRect(0, 0, width, height, radius)
      .endFill()
      .lineStyle(2, config.colors.outline, 1)
      .drawRoundedRect(1, 1, width - 2, height - 2, radius - 1);

    this._backgroundInner = new Graphics()
      .beginFill(config.colors.trackInner, 0.5)
      .drawRoundedRect(
        config.bar.padding,
        config.bar.padding,
        width - config.bar.padding * 2,
        height - config.bar.padding * 2,
        config.bar.radius,
      )
      .endFill();

    this._fill = new Graphics();
    this._fillHighlight = new Graphics();
    this._fillGlow = new Graphics();

    this._fillMask = new Graphics()
      .beginFill(0xffffff)
      .drawRoundedRect(
        config.bar.padding,
        config.bar.padding,
        width - config.bar.padding * 2,
        height - config.bar.padding * 2,
        config.bar.radius,
      )
      .endFill();

    this._fill.mask = this._fillMask;
    this._fillHighlight.mask = this._fillMask;
    this._fillGlow.mask = this._fillMask;

    this._icon = new Container();

    this._orbRed = this._createOrb(
      config.colors.red,
      -config.icon.orbSpacing,
      config.icon.redY,
    );

    this._orbBlue = this._createOrb(
      config.colors.blue,
      config.icon.orbSpacing,
      config.icon.blueY,
    );

    this._orbGreen = this._createOrb(
      config.colors.green,
      0,
      config.icon.greenY,
    );

    this._icon.addChild(this._orbRed, this._orbBlue, this._orbGreen);
    this._icon.position.set(0, config.icon.centerY);

    this._valueText = new Text(
      this._formatValue(),
      new TextStyle({
        fontFamily: "Bungee Regular",
        fontSize: config.text.fontSize,
        fontWeight: "700",
        fill: config.colors.text,
        stroke: config.colors.textOutline,
        strokeThickness: config.text.strokeThickness,
        letterSpacing: config.text.letterSpacing,
      }),
    );

    this._valueText.anchor.set(0, 0.5);
    this._valueText.scale.set(0.5);

    this.addChild(
      this._outerGlow,
      this._middleGlow,
      this._background,
      this._backgroundInner,
      this._fill,
      this._fillGlow,
      this._fillHighlight,
      this._valueText,
      this._icon,
    );

    this._fillMask.renderable = false;
    this.addChild(this._fillMask);

    this.setDisplayScale(options.displayScale ?? 1);

    this._update();
  }

  public setTarget(target: number): void {
    if (target <= 0) {
      throw new Error("CollectionProgress target must be greater than zero");
    }

    this._target = Math.floor(target);
    this._value = Math.min(this._value, this._target);
    this._valueText.text = this._formatValue();
    this._animateTo(this._value);
  }

  public setValue(value: number, animate = true): void {
    this._value = this._clampValue(value);
    this._valueText.text = this._formatValue();

    if (animate) {
      this._animateTo(this._value);
    } else {
      this._updateProgress(this._value);
    }
  }

  public setDisplayScale(scale: number): void {
    if (scale <= 0) {
      throw new Error("CollectionProgress scale must be greater than zero");
    }

    this._displayScale = scale;
    this.scale.set(scale);
  }

  public setEnabled(enabled: boolean): void {
    this.visible = enabled;
  }

  public destroy(
    options?:
      | boolean
      | {
          children?: boolean;
          texture?: boolean;
          baseTexture?: boolean;
        },
  ): void {
    gsap.killTweensOf(this._progressTween);

    super.destroy(options);
  }

  private _createOrb(color: number, x: number, y: number): Graphics {
    const config = CollectionProgress.CONFIG;

    return new Graphics()
      .beginFill(color, 0.2)
      .drawCircle(x, y, config.icon.orbRadius + 3)
      .endFill()
      .beginFill(color)
      .drawCircle(x, y, config.icon.orbRadius)
      .endFill()
      .beginFill(config.colors.orbHighlight, 0.45)
      .drawCircle(x - 2, y - 2, 2)
      .endFill();
  }

  private _update(): void {
    this._updateProgress(this._progressTween.value);
  }

  public animateTo(targetValue: number, duration = 1): Promise<void> {
    const clampedTarget = this._clampValue(targetValue);
    const startValue = this._value;

    if (startValue === clampedTarget) {
      return Promise.resolve();
    }

    gsap.killTweensOf(this._progressTween);

    return new Promise((resolve) => {
      const state = {
        value: startValue,
      };

      gsap.to(state, {
        value: clampedTarget,
        duration,
        ease: "none",

        onUpdate: () => {
          const nextValue = Math.round(state.value);

          if (nextValue !== this._value) {
            this._value = nextValue;
            this._valueText.text = this._formatValue();

            this._pulse();
          }

          this._progressTween.value = state.value;
          this._update();
        },

        onComplete: () => {
          this._value = clampedTarget;
          this._valueText.text = this._formatValue();

          this._progressTween.value = clampedTarget;
          this._update();

          resolve();
        },
      });
    });
  }

  private _animateTo(targetValue: number): Promise<void> {
    gsap.killTweensOf(this._progressTween);

    const currentValue = this._progressTween.value;

    if (Math.abs(currentValue - targetValue) > 0.001) {
      this._pulse();
    }

    return new Promise((resolve) => {
      gsap.to(this._progressTween, {
        value: targetValue,
        duration: CollectionProgress.CONFIG.animation.duration,
        ease: CollectionProgress.CONFIG.animation.ease,

        onUpdate: () => {
          this._update();
        },

        onComplete: resolve,
      });
    });
  }

  private _pulse(): void {
    gsap.killTweensOf(this.scale);

    // Make sure we start from the intended display scale.
    this.scale.set(this._displayScale);

    gsap.to(this.scale, {
      x: this._displayScale * 1.025,
      y: this._displayScale * 1.025,
      duration: 0.08,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.scale.set(this._displayScale);
      },
    });
  }

  private _updateProgress(value: number): void {
    const config = CollectionProgress.CONFIG;
    const progress = Math.max(0, Math.min(1, value / this._target));
    const innerWidth = config.size.width - config.bar.padding * 2;
    const innerHeight = config.size.height - config.bar.padding * 2;
    const width = innerWidth * progress;

    const fillColor = this._lerpColor(
      config.colors.red,
      config.colors.fill,
      progress,
    );

    this._fill.clear();
    this._fillHighlight.clear();
    this._fillGlow.clear();

    if (width > 0) {
      const highlightColor = this._lightenColor(fillColor, 0.45);
      const glowColor = this._lightenColor(fillColor, 0.2);

      this._fill
        .beginFill(fillColor)
        .drawRect(config.bar.padding, config.bar.padding, width, innerHeight)
        .endFill();

      this._fillHighlight
        .beginFill(highlightColor, 0.32)
        .drawRect(
          config.bar.padding,
          config.bar.padding + 3,
          width,
          innerHeight * 0.42,
        )
        .endFill();

      this._fillGlow
        .beginFill(glowColor, 0.3)
        .drawRect(
          config.bar.padding,
          config.bar.padding + innerHeight * 0.6,
          width,
          innerHeight * 0.4,
        )
        .endFill();
    }

    this._updateTextAndIconPosition(value);
  }

  private _lerpColor(from: number, to: number, progress: number): number {
    const r1 = (from >> 16) & 0xff;
    const g1 = (from >> 8) & 0xff;
    const b1 = from & 0xff;

    const r2 = (to >> 16) & 0xff;
    const g2 = (to >> 8) & 0xff;
    const b2 = to & 0xff;

    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);

    return (r << 16) | (g << 8) | b;
  }

  private _lightenColor(color: number, amount: number): number {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    const lighten = (channel: number) =>
      Math.round(channel + (255 - channel) * amount);

    return (lighten(r) << 16) | (lighten(g) << 8) | lighten(b);
  }

  private _updateTextAndIconPosition(value: number): void {
    const config = CollectionProgress.CONFIG;
    const progress = Math.max(0, Math.min(1, value / this._target));
    const innerWidth = config.size.width - config.bar.padding * 2;
    const fillWidth = innerWidth * progress;

    const iconHalfWidth =
      config.icon.orbSpacing + config.icon.orbRadius + config.icon.outerPadding;

    /*
     * Keep the complete orb cluster inside
     * the bar's inner bounds.
     */
    const iconMinX = config.bar.padding + iconHalfWidth;
    const iconMaxX = config.size.width - config.bar.padding - iconHalfWidth;

    /*
     * First determine where the text would naturally sit based on the progress.
     */
    const desiredTextX =
      config.bar.padding + fillWidth + config.bar.textPadding;

    /*
     * The icon must remain immediately to the right of the text.
     */
    const desiredIconX =
      desiredTextX + this._valueText.width + config.bar.orbGap + iconHalfWidth;

    /*
     * Clamp the icon to the inside of the bar.
     */
    const iconX = Math.max(iconMinX, Math.min(desiredIconX, iconMaxX));

    /*
     * Position the text based on the actual clamped icon position.
     */
    const maxTextX =
      iconX - iconHalfWidth - config.bar.orbGap - this._valueText.width;

    const textX = Math.min(desiredTextX, maxTextX);

    this._valueText.x = Math.max(
      config.bar.padding + config.bar.textPadding,
      textX,
    );

    this._valueText.y = config.size.height / 2;

    const finalIconX =
      this._valueText.x +
      this._valueText.width +
      config.bar.orbGap +
      iconHalfWidth;

    this._icon.position.set(
      Math.max(iconMinX, Math.min(finalIconX, iconMaxX)),
      config.icon.centerY,
    );
  }

  private _clampValue(value: number): number {
    return Math.max(0, Math.min(value, this._target));
  }

  private _formatValue(): string {
    return `${this._value} / ${this._target}`;
  }
}
