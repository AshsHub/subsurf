import { Assets, Container } from "pixi.js";
import { CollectionProgress } from "./CollectionProgress";
import { ControlsDemo } from "./ControlsDemo";
import { IconButton } from "./IconButton";
import type { Resizable } from "./UIRoot";

export class GameUI extends Container implements Resizable {
  private static readonly CONFIG = {
    pausePadding: 20,
  };
  private readonly pauseButton: IconButton;
  private readonly collectionProgress: CollectionProgress;
  private readonly controlsDemo: ControlsDemo;
  private _demoHidden = false;

  constructor(onPause: () => void, targetCollections: number) {
    super();

    this.pauseButton = new IconButton({
      icon: Assets.get("icon-pause"),
      width: 56,
      height: 56,
      onClick: () => {
        onPause();
      },
    });

    this.collectionProgress = new CollectionProgress({
      target: targetCollections,
      displayScale: 1.5,
    });
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
    this.collectionProgress.setValue(0, false);
  }

  public onResize(width: number, height: number): void {
    const config = GameUI.CONFIG;
    this.pauseButton.position.set(
      width - this.pauseButton.width / 2 - config.pausePadding,
      this.pauseButton.height / 2 + config.pausePadding,
    );

    this.collectionProgress.position.set(
      width / 2 - this.collectionProgress.width / 2,
      config.pausePadding,
    );
    this.controlsDemo.onResize(width, height);
  }
}
