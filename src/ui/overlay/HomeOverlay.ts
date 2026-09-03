import { Application, Container, FederatedPointerEvent } from "pixi.js";
import { Logo } from "../Logo";
import type { Overlay } from "./Overlay";
import { TextButton } from "../TextButton";

export interface HomeOverlayOptions {
  onRequestClose: () => void;
}

export class HomeOverlay extends Container implements Overlay {
  private readonly startButton: TextButton;
  private readonly logo: Logo;

  constructor(options: HomeOverlayOptions) {
    super();

    this.logo = new Logo({
      text: "SubSurf",
      fontFamily: "Bungee Regular",
      fontSize: 76,
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
      onClick: options.onRequestClose,
      onPointerEnter: () => {
        this.logo.animation = "pop";
      },
      onPointerLeave: () => {
        this.logo.animation = "wave";
      },
    });

    this.addChild(this.startButton);
    this.addChild(this.logo);

    this.eventMode = "static";

    this.on("pointermove", this.handlePointerMove);
  }

  public onEnter(_app: Application): void | Promise<void> {}

  public onExit() {
    this.off("pointermove", this.handlePointerMove);
  }

  private readonly handlePointerMove = (event: FederatedPointerEvent) => {
    const point = this.toLocal(event.global);
  };

  onResize(width: number, height: number) {
    this.startButton.position.set(width * 0.5, height * 0.7);
    this.logo.position.set(width * 0.5, height * 0.3);
  }
}
