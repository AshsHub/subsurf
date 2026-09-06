import { Graphics, Text } from "pixi.js";
import { AnimatedButton, type AnimatedButtonOptions } from "./AnimatedButton";

export interface TextButtonOptions extends AnimatedButtonOptions {
  text: string;
  fontFamily?: string;
  width?: number;
  height?: number;
}

export class TextButton extends AnimatedButton {
  private readonly background: Graphics;
  private readonly label: Text;

  constructor(options: TextButtonOptions) {
    super(options);

    const width = options.width ?? 240;
    const height = options.height ?? 72;

    this.background = new Graphics()
      .beginFill(0xc94f7c)
      .drawRoundedRect(0, 0, width, height, 12)
      .endFill();

    this.label = new Text(options.text, {
      fill: 0xffffff,
      fontFamily: options.fontFamily ?? "Bungee Regular",
      fontSize: 24,
      fontWeight: "700",
    });

    this.label.anchor.set(0.5);
    this.label.position.set(width / 2, height / 2);

    this.addChild(this.background, this.label);

    // Centre the button around its position.
    this.pivot.set(width / 2, height / 2);
  }

  public set text(text: string) {
    this.label.text = text;
  }

  public get text(): string {
    return this.label.text;
  }
}
