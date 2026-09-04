import { Container, Graphics, Text } from "pixi.js";
import { gsap } from "gsap";

const WIDTH = 220;
const HEIGHT = 64;

const BAR_X = 52;
const BAR_Y = 38;
const BAR_WIDTH = 150;
const BAR_HEIGHT = 8;

export class CollectionProgress extends Container {
  private readonly background: Graphics;
  private readonly iconBackground: Graphics;
  private readonly icon: Graphics;
  private readonly barBackground: Graphics;
  private readonly barFill: Graphics;
  private readonly valueText: Text;

  private readonly target: number;

  private value = 0;
  private displayedProgress = 0;

  constructor(target: number) {
    super();

    if (target <= 0) {
      throw new Error("CollectionProgress target must be greater than zero");
    }

    this.target = target;

    this.background = new Graphics()
      .beginFill(0x18181b, 0.88)
      .drawRoundedRect(0, 0, WIDTH, HEIGHT, HEIGHT / 2)
      .endFill();

    this.iconBackground = new Graphics()
      .beginFill(0xc94f7c)
      .drawCircle(28, HEIGHT / 2, 18)
      .endFill();

    this.icon = new Graphics()
      .beginFill(0xffd85c)
      .drawCircle(28, HEIGHT / 2, 9)
      .endFill()
      .lineStyle(2, 0xfff0a8)
      .drawCircle(28, HEIGHT / 2, 9);

    this.barBackground = new Graphics()
      .beginFill(0xffffff, 0.14)
      .drawRoundedRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT, BAR_HEIGHT / 2)
      .endFill();

    this.barFill = new Graphics();

    this.valueText = new Text("0 / 0", {
      fill: 0xffffff,
      fontSize: 20,
      fontWeight: "700",
    });

    this.valueText.anchor.set(0, 0.5);
    this.valueText.position.set(BAR_X, 20);

    this.addChild(
      this.background,
      this.iconBackground,
      this.icon,
      this.barBackground,
      this.barFill,
      this.valueText,
    );

    this.pivot.set(WIDTH / 2, 0);

    this._update();
  }

  public setValue(value: number): void {
    const nextValue = Math.max(0, Math.min(value, this.target));

    this.value = nextValue;

    gsap.to(this, {
      displayedProgress: nextValue / this.target,
      duration: 0.25,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        this._updateBar();
      },
    });

    this.valueText.text = `${this.value} / ${this.target}`;

    if (nextValue > 0) {
      this._animateCollection();
    }
  }

  public setEnabled(enabled: boolean): void {
    this.visible = enabled;
  }

  public destroy(
    options?:
      | boolean
      | { children?: boolean; texture?: boolean; baseTexture?: boolean },
  ): void {
    gsap.killTweensOf(this);

    super.destroy(options);
  }

  private _update(): void {
    this.displayedProgress = this.value / this.target;

    this.valueText.text = `${this.value} / ${this.target}`;

    this._updateBar();
  }

  private _updateBar(): void {
    const width = BAR_WIDTH * this.displayedProgress;

    this.barFill.clear();

    if (width <= 0) {
      return;
    }

    this.barFill
      .beginFill(0xffd85c)
      .drawRoundedRect(BAR_X, BAR_Y, width, BAR_HEIGHT, BAR_HEIGHT / 2)
      .endFill();
  }

  private _animateCollection(): void {
    gsap.killTweensOf(this.iconBackground.scale);
    gsap.killTweensOf(this.icon.scale);

    this.iconBackground.scale.set(1);
    this.icon.scale.set(1);

    gsap
      .timeline()
      .to([this.iconBackground.scale, this.icon.scale], {
        x: 1.18,
        y: 1.18,
        duration: 0.1,
        ease: "power2.out",
      })
      .to([this.iconBackground.scale, this.icon.scale], {
        x: 1,
        y: 1,
        duration: 0.2,
        ease: "back.out(2)",
      });
  }
}
