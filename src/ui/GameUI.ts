import { Assets, Container } from "pixi.js";
import { CollectionProgress } from "./CollectionProgress";
import { IconButton } from "./IconButton";
import { MobileControlsDemo } from "./MobileControlsDemo";
import { ControlsDemo } from "./ControlsDemo";

export class GameUI extends Container {
  private static readonly CONFIG = {
    pausePadding: 20,
    progressBarScale: 1.5,
  };
  private readonly pauseButton: IconButton;
  private readonly collectionProgress: CollectionProgress;
  private readonly controlsDemo: ControlsDemo | MobileControlsDemo;

  private readonly pauseButtonBaseWidth: number;
  private readonly progressBarBaseWidth: number;

  private _demoHidden = false;

  constructor(
    isMobile = false,
    onPause: () => void,
    targetCollections: number,
  ) {
    super();

    this.pauseButton = new IconButton({
      icon: Assets.get("icon-pause"),
      width: 56,
      height: 56,
      onClick: () => {
        onPause();
      },
    });

    this.pauseButtonBaseWidth = this.pauseButton.width;

    this.collectionProgress = new CollectionProgress({
      target: targetCollections,
      displayScale: GameUI.CONFIG.progressBarScale,
    });
    this.progressBarBaseWidth = this.collectionProgress.width;
    this.controlsDemo = isMobile
      ? new MobileControlsDemo()
      : new ControlsDemo();
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
    const availableWidth = width - config.pausePadding * 3;
    const normalWidth = this.progressBarBaseWidth + this.pauseButtonBaseWidth;
    const responsiveScale = Math.min(
      1,
      Math.max(0, availableWidth / normalWidth),
    );

    this.pauseButton.scale.set(responsiveScale);

    this.collectionProgress.setDisplayScale(
      config.progressBarScale * responsiveScale,
    );

    this.collectionProgress.position.set(
      config.pausePadding,
      config.pausePadding,
    );

    const pauseWidth = this.pauseButtonBaseWidth * responsiveScale;
    this.pauseButton.position.set(
      width - pauseWidth / 2 - config.pausePadding,
      pauseWidth / 2 + config.pausePadding,
    );

    this.controlsDemo.onResize(width, height);
  }
}
