import { Container, Graphics, Text } from "pixi.js";
import { gsap } from "gsap";
import type { Scene } from "./Scene";

export class LoadingScene extends Container implements Scene {
  private readonly backdrop = new Graphics();
  private readonly spinner = new Graphics();
  private readonly progressLabel = new Text("0%", {
    fill: "#6c3950",
    fontFamily: "Georgia, serif",
    fontSize: 26,
    fontWeight: "700",
  });

  constructor() {
    super();
    this.alpha = 0;
    this.build();
  }

  setProgress(progress: number) {
    this.progressLabel.text = `${Math.round(progress * 100)}%`;
  }

  async fadeIn() {
    await gsap.to(this, {
      alpha: 1,
      duration: 0.35,
      ease: "power2.out",
    });
  }

  async fadeOut() {
    await gsap.to(this, {
      alpha: 0,
      duration: 0.35,
      ease: "power2.inOut",
    });
  }

  onEnter() {
    gsap.to(this.spinner, {
      rotation: Math.PI * 2,
      duration: 1.1,
      repeat: -1,
      ease: "power1.inOut",
    });
  }

  onExit() {
    gsap.killTweensOf([this, this.spinner]);
  }

  onResize(width: number, height: number) {
    this.backdrop.clear().drawRect(0, 0, width, height).beginFill("#f9edf2");
    this.spinner.position.set(width * 0.5, height * 0.5);
    this.progressLabel.anchor.set(0.5);
    this.progressLabel.position.set(
      width * 0.5,
      this.spinner.position.y +
        this.spinner.height +
        this.progressLabel.height * 0.5,
    );
  }

  private build() {
    this.addChild(this.backdrop);
    this.spinner.arc(0, 0, 34, -Math.PI * 0.25, Math.PI * 1.35);
    // .stroke({ color: "#c94f7c", width: 7, cap: "round" });

    this.addChild(this.spinner, this.progressLabel);
  }
}
