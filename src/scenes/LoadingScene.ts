import { Container, Graphics, Text } from "pixi.js";
import { gsap } from "gsap";
import type { Scene } from "./Scene";

export class LoadingScene extends Container implements Scene {
  private readonly backdrop = new Graphics();
  private readonly card = new Graphics();
  private readonly spinnerTrack = new Graphics();
  private readonly spinner = new Graphics();

  private readonly progressLabel = new Text("0%", {
    fill: "#6c3950",
    fontFamily: "Georgia, serif",
    fontSize: 28,
    fontWeight: "700",
  });

  private readonly loadingLabel = new Text("Loading", {
    fill: "#9a6178",
    fontFamily: "Arial, sans-serif",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 1.5,
  });

  constructor() {
    super();

    this.alpha = 0;

    this.build();
  }

  public setProgress(progress: number): void {
    const value = Math.max(0, Math.min(1, progress));

    this.progressLabel.text = `${Math.round(value * 100)}%`;
  }

  public async fadeIn(): Promise<void> {
    await gsap.to(this, {
      alpha: 1,
      duration: 0.35,
      ease: "power2.out",
    });
  }

  public async fadeOut(): Promise<void> {
    await gsap.to(this, {
      alpha: 0,
      duration: 0.35,
      ease: "power2.inOut",
    });
  }

  public onEnter(): void {
    gsap.to(this.spinner, {
      rotation: Math.PI * 2,
      duration: 1.15,
      repeat: -1,
      ease: "none",
    });

    gsap.to(this.spinner, {
      alpha: 0.7,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.fromTo(
      this.card,
      {
        alpha: 0.7,
        scale: 0.96,
      },
      {
        alpha: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.4)",
      },
    );
  }

  public onExit(): void {
    gsap.killTweensOf([this, this.spinner, this.card]);
  }

  public onResize(width: number, height: number): void {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.backdrop
      .clear()
      .beginFill("#f9edf2")
      .drawRect(0, 0, width, height)
      .endFill();

    const size = Math.min(width, height);

    const cardWidth = Math.min(300, size * 0.7);
    const cardHeight = Math.min(250, size * 0.55);

    this.card.position.set(centerX, centerY);

    this.card
      .clear()
      .beginFill("#fff8fb")
      .drawRoundedRect(
        -cardWidth * 0.5,
        -cardHeight * 0.5,
        cardWidth,
        cardHeight,
        24,
      )
      .endFill();

    const spinnerRadius = Math.min(42, size * 0.09);
    const spinnerWidth = Math.max(6, size * 0.012);

    this.spinnerTrack.position.set(centerX, centerY - 18);

    this.spinnerTrack
      .clear()
      .lineStyle({
        width: spinnerWidth,
        color: 0xe8ceda,
        alpha: 1,
      })
      .drawCircle(0, 0, spinnerRadius);

    this.spinner.position.set(centerX, centerY - 18);

    this.spinner
      .clear()
      .lineStyle({
        width: spinnerWidth,
        color: 0xc94f7c,
        alpha: 1,
      })
      .arc(0, 0, spinnerRadius, -Math.PI * 0.35, Math.PI * 0.9);

    this.progressLabel.anchor.set(0.5);
    this.progressLabel.position.set(centerX, centerY - 18);

    this.loadingLabel.anchor.set(0.5);
    this.loadingLabel.position.set(centerX, centerY + spinnerRadius + 28);
  }

  private build(): void {
    this.addChild(
      this.backdrop,
      this.card,
      this.spinnerTrack,
      this.spinner,
      this.progressLabel,
      this.loadingLabel,
    );
  }
}
