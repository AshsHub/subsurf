import { Assets, Container, Graphics, Text } from "pixi.js";
import { TextButton } from "../TextButton";
import { IconButton } from "../IconButton";
import type { Overlay } from "./Overlay";

export interface PauseOverlayOptions {
  onResume: () => void;
  onToggleMute: () => void;
  muted: boolean;
}

export interface PauseOverlayMeta {}

export class PauseOverlay extends Container implements Overlay {
  private static readonly CONFIG = {
    backgroundColor: 0x000000,
    backgroundAlpha: 0.5,

    contentMaxWidthRatio: 0.9,
    contentMaxHeightRatio: 0.7,

    titleButtonGap: 30,
    mutePadding: 20,
  };

  private readonly _background: Graphics;
  private readonly _content: Container;
  private readonly _title: Text;
  private readonly _resumeButton: TextButton;
  private readonly _muteButton: IconButton;
  private readonly _onToggleMute: () => void;

  constructor(options: PauseOverlayOptions) {
    super();

    this._background = new Graphics()
      .beginFill(
        PauseOverlay.CONFIG.backgroundColor,
        PauseOverlay.CONFIG.backgroundAlpha,
      )
      .drawRect(0, 0, 1, 1)
      .endFill();

    this._content = new Container();

    this._title = new Text("PAUSED", {
      fill: 0xffffff,
      fontFamily: "Bungee Regular",
      fontSize: 48,
      fontWeight: "700",
    });

    this._title.anchor.set(0.5);

    this._resumeButton = new TextButton({
      text: "Resume",
      width: 240,
      height: 72,
      onClick: options.onResume,
    });

    this._onToggleMute = options.onToggleMute;

    this._muteButton = new IconButton({
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

    this._content.addChild(this._title, this._resumeButton);

    this.addChild(this._background, this._content, this._muteButton);

    this.eventMode = "static";
  }

  public onResize(width: number, height: number): void {
    const {
      contentMaxWidthRatio,
      contentMaxHeightRatio,
      titleButtonGap,
      mutePadding,
    } = PauseOverlay.CONFIG;

    // Resize the overlay background to the renderer dimensions.
    this._background.clear();
    this._background
      .beginFill(
        PauseOverlay.CONFIG.backgroundColor,
        PauseOverlay.CONFIG.backgroundAlpha,
      )
      .drawRect(0, 0, width, height)
      .endFill();

    // Position the resume button relative to the title.
    this._resumeButton.position.set(0, this._title.height + titleButtonGap);

    // Scale the content down if it doesn't fit on smaller screens.
    const bounds = this._content.getLocalBounds();

    if (bounds.width > 0 && bounds.height > 0) {
      const maxWidth = width * contentMaxWidthRatio;
      const maxHeight = height * contentMaxHeightRatio;

      const scale = Math.min(
        1,
        maxWidth / bounds.width,
        maxHeight / bounds.height,
      );

      this._content.scale.set(scale);

      // Center the content while accounting for its local bounds.
      this._content.position.set(width * 0.5, height * 0.5);

      this._content.position.x -= (bounds.x + bounds.width * 0.5) * scale;

      this._content.position.y -= (bounds.y + bounds.height * 0.5) * scale;
    }

    // Keep the mute button pinned to the top-right corner.
    this._muteButton.position.set(
      width - mutePadding - this._muteButton.width * 0.5,
      mutePadding + this._muteButton.height * 0.5,
    );
  }
}
