import gsap from "gsap";
import { Application, Assets, Container } from "pixi.js";
import { Logo } from "../Logo";
import type { Overlay } from "./Overlay";
import { TextButton } from "../TextButton";
import { IrisRevealBackground } from "./IrisRevealBackground";
import { IconButton } from "../IconButton";

export interface HomeOverlayOptions {
  onRequestStart: () => void;
  onToggleMute: () => void;
  muted: boolean;
}

export class HomeOverlay extends Container implements Overlay {
  private static readonly CONFIG = {
    backgroundColor: 0xf9edf2,
    contentMaxWidthRatio: 0.9,
    contentMaxHeightRatio: 0.7,
    buttonGap: 40,
    mutePadding: 20,
  };

  private readonly startButton: TextButton;
  private readonly muteButton: IconButton;
  private readonly _logo: Logo;
  private readonly content: Container;
  private readonly background: IrisRevealBackground;
  private readonly _onToggleMute: () => void;

  constructor(options: HomeOverlayOptions) {
    super();

    this.background = new IrisRevealBackground(
      HomeOverlay.CONFIG.backgroundColor,
    );

    this.content = new Container();

    this._onToggleMute = options.onToggleMute;

    this._logo = new Logo({
      text: "Astro Rush",
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
      onClick: () => {
        this.startButton.setEnabled(false);
        this.startButton.text = "Starting";
        options.onRequestStart();
      },
      onPointerEnter: () => {
        this._logo.animation = "pop";
      },
      onPointerLeave: () => {
        this._logo.animation = "wave";
      },
    });

    this.muteButton = new IconButton({
      icons: {
        on: Assets.get("icon-mute"),
        off: Assets.get("icon-unmute"),
      },
      initialState: options.muted ? "on" : "off",
      width: 56,
      height: 56,
      onClick: () => {
        this._onToggleMute();
      },
    });

    this.content.addChild(this._logo, this.startButton);

    this.addChild(this.background, this.content, this.muteButton);

    this.eventMode = "static";
  }

  public onEnter(_app: Application): void {
    this.background.visible = true;
    this.content.visible = true;
    this.muteButton.visible = true;

    this._logo.alpha = 1;
    this.startButton.alpha = 1;
    this.muteButton.alpha = 1;
  }

  public async animateOut(): Promise<void> {
    this._logo.stopAnimation();

    await Promise.all([
      gsap.to(this.startButton, {
        alpha: 0,
        duration: 0.2,
      }),

      gsap.to(this.muteButton, {
        alpha: 0,
        duration: 0.2,
      }),

      gsap.to(this.background, {
        revealRatio: 1,
        duration: 0.35,
        ease: "power3.in",
      }),
    ]);

    await gsap.to(this._logo, {
      alpha: 0,
      duration: 0.2,
      ease: "power3.out",
      delay: 2,
    });

    this.background.visible = false;
  }

  public onResize(width: number, height: number): void {
    this.background.onResize(width, height);

    const {
      contentMaxWidthRatio,
      contentMaxHeightRatio,
      buttonGap,
      mutePadding,
    } = HomeOverlay.CONFIG;

    this.startButton.position.set(0, this._logo.height + buttonGap);

    const bounds = this.content.getLocalBounds();

    if (bounds.width > 0 && bounds.height > 0) {
      const maxWidth = width * contentMaxWidthRatio;
      const maxHeight = height * contentMaxHeightRatio;

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

    this.muteButton.position.set(
      width - mutePadding - this.muteButton.width * 0.5,
      mutePadding + this.muteButton.height * 0.5,
    );
  }
}
