import { Container, Graphics } from "pixi.js";

export class IrisRevealBackground extends Container {
  private readonly _background = new Graphics();

  private _color: number;
  private _revealRatio = 0;

  private _screenWidth = 0;
  private _screenHeight = 0;

  constructor(color: number) {
    super();

    this._color = color;

    this.addChild(this._background);
  }

  public set revealRatio(value: number) {
    this._revealRatio = Math.max(0, Math.min(1, value));
    this.draw();
  }

  public get revealRatio(): number {
    return this._revealRatio;
  }

  public set color(value: number) {
    this._color = value;
    this.draw();
  }

  public onResize(width: number, height: number): void {
    this._screenWidth = width;
    this._screenHeight = height;

    this.draw();
  }

  public draw(): void {
    this._background.clear();

    if (this._screenWidth <= 0 || this._screenHeight <= 0) {
      return;
    }

    const centerX = this._screenWidth * 0.5;
    const centerY = this._screenHeight * 0.5;

    const maxRadius = Math.hypot(centerX, centerY);
    const radius = maxRadius * this._revealRatio;

    this._background
      .beginFill(this._color)
      .drawRect(
        -maxRadius,
        -maxRadius,
        this._screenWidth + maxRadius * 2,
        this._screenHeight + maxRadius * 2,
      );

    if (radius > 0) {
      this._background
        .beginHole()
        .drawCircle(centerX, centerY, radius)
        .endHole();
    }

    this._background.endFill();
  }

  public destroy(
    options?: boolean | Parameters<Container["destroy"]>[0],
  ): void {
    this._background.destroy();
    super.destroy(options);
  }
}
