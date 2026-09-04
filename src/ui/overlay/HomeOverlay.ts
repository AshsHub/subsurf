import gsap from "gsap";
import { Application, Container } from "pixi.js";
import { Logo } from "../Logo";
import type { Overlay } from "./Overlay";
import { TextButton } from "../TextButton";
import { IrisRevealBackground } from "./IrisRevealBackground";

export interface HomeOverlayOptions {
  onRequestStart: () => void;
}

const BACKGROUND_COLOR = 0xf9edf2;

export class HomeOverlay extends Container implements Overlay {
  private readonly startButton: TextButton;
  private readonly logo: Logo;
  private readonly content: Container;
  private readonly background: IrisRevealBackground;

  constructor(options: HomeOverlayOptions) {
    super();

    this.background = new IrisRevealBackground(BACKGROUND_COLOR);

    this.content = new Container();

    this.logo = new Logo({
      text: "SubSurf",
      fontFamily: "Bungee Regular",
      fontSize: 120,
      fill: 0xffd900,
      stroke: 0x0055a5,
      strokeThickness: 9,
      characterSpacing: -2,
      animation: "wave",
      animationDuration: 0.55,
      animationDelay: 0.07,
    });

    this.startButton = new TextButton({
      text: "Start",
      onClick: options.onRequestStart,
      onPointerEnter: () => {
        this.logo.animation = "pop";
      },
      onPointerLeave: () => {
        this.logo.animation = "wave";
      },
    });

    this.content.addChild(this.logo, this.startButton);

    this.addChild(this.background, this.content);

    this.eventMode = "static";
  }

  public onEnter(_app: Application): void {
    this.background.visible = true;
    this.content.visible = true;
    this.logo.alpha = 1;
    this.startButton.alpha = 1;
  }

  public async animateOut(): Promise<void> {
    this.logo.stopAnimation();

    await Promise.all([
      gsap.to(this.startButton, {
        alpha: 0,
        duration: 0.2,
      }),

      gsap.to(this.background, {
        revealRatio: 1,
        duration: 0.35,
        ease: "power3.in",
      }),
    ]);

    await new Promise<void>((resolve) => {
      gsap.delayedCall(1, async () => {
        await this.logo.explodeOnce();
        resolve();
      });
    });

    this.background.visible = false;
  }

  public onResize(width: number, height: number): void {
    this.background.onResize(width, height);
    const gap = 40;

    this.startButton.position.set(0, this.logo.height + gap);

    const bounds = this.content.getLocalBounds();
    const maxWidth = width * 0.9;
    const maxHeight = height * 0.7;

    const scale = Math.min(
      1,
      maxWidth / bounds.width,
      maxHeight / bounds.height,
    );

    this.content.scale.set(scale);

    this.content.position.set(width * 0.5, height * 0.5);

    this.content.position.x -= (bounds.x + bounds.width * 0.5) * scale;
    this.content.position.y -= (bounds.y + bounds.height * 0.5) * scale;
  }
}
