import { Graphics, Sprite, Texture } from "pixi.js";
import { AnimatedButton, type AnimatedButtonOptions } from "./AnimatedButton";

export type IconButtonState = "on" | "off";

export interface IconButtonOptions extends AnimatedButtonOptions {
  width?: number;
  height?: number;
  icon?: Texture;
  icons?: {
    on: Texture;
    off: Texture;
  };
  initialState?: IconButtonState;
  onToggle?: (state: IconButtonState) => void;
  backgroundColor?: number;
  borderRadius?: number;
  iconScale?: number;
}

export class IconButton extends AnimatedButton {
  private readonly background: Graphics;
  private readonly icon: Sprite;

  private readonly _toggleIcons?: {
    on: Texture;
    off: Texture;
  };

  private readonly _onToggle?: (state: IconButtonState) => void;

  private readonly _iconScale: number;

  private _state: IconButtonState;

  constructor(options: IconButtonOptions) {
    super({
      ...options,
      onClick: () => {
        options.onClick?.();

        if (options.icons) {
          this.toggle();
        }
      },
    });

    const width = options.width ?? 64;
    const height = options.height ?? 64;

    this._iconScale = options.iconScale ?? 0.6;
    this._state = options.initialState ?? "on";
    this._toggleIcons = options.icons;
    this._onToggle = options.onToggle;

    const texture = options.icons ? options.icons[this._state] : options.icon;

    if (!texture) {
      throw new Error(
        "IconButton requires either an icon or both toggle icons.",
      );
    }

    this.background = new Graphics()
      .beginFill(options.backgroundColor ?? 0xc94f7c)
      .drawRoundedRect(0, 0, width, height, options.borderRadius ?? 12)
      .endFill();

    this.icon = new Sprite(texture);
    this.icon.anchor.set(0.5);

    this.addChild(this.background, this.icon);

    this.pivot.set(width / 2, height / 2);

    this._fitIcon();
  }

  public get state(): IconButtonState {
    return this._state;
  }

  public toggle(): IconButtonState {
    if (!this._toggleIcons) {
      return this._state;
    }

    this._state = this._state === "on" ? "off" : "on";

    this.icon.texture = this._toggleIcons[this._state];

    this._fitIcon();

    this._onToggle?.(this._state);

    return this._state;
  }

  public setState(state: IconButtonState): void {
    if (!this._toggleIcons || this._state === state) {
      return;
    }

    this._state = state;
    this.icon.texture = this._toggleIcons[state];

    this._fitIcon();
  }

  private _fitIcon(): void {
    const width = this.background.width;
    const height = this.background.height;

    const maxWidth = width * this._iconScale;
    const maxHeight = height * this._iconScale;

    const scale = Math.min(
      maxWidth / this.icon.texture.width,
      maxHeight / this.icon.texture.height,
    );

    this.icon.scale.set(scale);
    this.icon.position.set(width / 2, height / 2);
  }
}
