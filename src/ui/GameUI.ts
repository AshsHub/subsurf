import { Container } from "pixi.js";
import { TextButton } from "./TextButton";
import { CollectionProgress } from "./CollectionProgress";
import { ControlsDemo } from "./ControlsDemo";
import type { Resizable } from "./UIRoot";

const UI_PADDING = 24;

export class GameUI extends Container implements Resizable {
  private readonly pauseButton: TextButton;
  private readonly collectionProgress: CollectionProgress;
  private readonly controlsDemo: ControlsDemo;
  private _demoHidden = false;

  constructor(onPause: () => void, targetCollections: number) {
    super();

    this.pauseButton = new TextButton({
      text: "||",
      fontFamily: "Bungee Regular",
      width: 56,
      height: 56,
      onClick: onPause,
      hoverScale: 1.08,
      pressedScale: 0.92,
      animationDuration: 0.15,
    });

    this.collectionProgress = new CollectionProgress(targetCollections);
    this.controlsDemo = new ControlsDemo();

    this.addChild(this.collectionProgress, this.pauseButton, this.controlsDemo);

    this.hide();
  }

  public show(): void {
    this.visible = true;
    this.eventMode = "static";

    this.pauseButton.setEnabled(true);
    this.collectionProgress.setEnabled(true);
    if (!this._demoHidden) this.controlsDemo.show();
  }

  public hide(): void {
    this.visible = false;
    this.eventMode = "none";

    this.pauseButton.setEnabled(false);
    this.collectionProgress.setEnabled(false);
    this.controlsDemo.hide();
  }

  public hideDemo(): void {
    this._demoHidden = true;
    this.controlsDemo.hide();
  }

  public setCollections(value: number): void {
    this.collectionProgress.setValue(value);
  }

  public reset(): void {
    this.collectionProgress.setValue(0);
  }

  public onResize(width: number, height: number): void {
    this.pauseButton.position.set(
      width - this.pauseButton.width / 2 - UI_PADDING,
      this.pauseButton.height / 2 + UI_PADDING,
    );

    this.collectionProgress.position.set(width / 2, UI_PADDING);
    this.controlsDemo.onResize(width, height);
  }
}
